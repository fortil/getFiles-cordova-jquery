declare const openDatabase: any

function MakeID(a:number){
  var text = "";
  var num = a || 10;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < num; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function uuid(a:any):any{return a?(0|Math.random()*16).toString(16):(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,uuid)}

interface SQLConfig {
  name: string
  version?: string
  description?: string
  size?: number,
  idRegistro?: string,
  idPregunta?: string,
}

// Data contructor (FP pattern)
const SQL = function(config: SQLConfig){ 
  let name = config.name;
  let version:string = config.version || '1.0.0';
  let description:string = config.description || 'SQL DB';
  let size:number = config.size || (64 * 1024);
  let tableName: string = null;
  let fields: string = '';
  return {
    name,
    version,
    description,
    size,
    tableName,
    fields,
    db: openDatabase(name, version, description, size),
    /*
    * Recive un objeto "params" donde este tiene
    * name: el nombre de la tabla y
    * fields: un array de los campos que la tabla tendrá
    * Opcionalmente recibe un callback de un resultado positivo
    * y una función de un posible error
    */
    createTable: function (params:any, cb = (obj:any) => console.log(obj,'ok createTable'), error = (tx:any, e: any) => console.log('error createTable',e)){
      this.tableName = params.name;
      let flds: Array<string> = params.fields;

      for (var i = 0; i < flds.length; i++)
        this.fields += (i==0 ? flds[i] : `, ${flds[i]}`);

      this.db.transaction( (tx:any) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${name} (${flds})`,
          [],
          (tx:any, res:any)=>cb({ name, res }),
          error
        );
      })
    },
    /*
    * Recive un objeto "records" en el cual se especifica 
    * la key es el campo a ingresar y el valor de la key el valor del campo
    * Ej: { id: 1, data1: 2, data2: 3 }
    */
    insertValue: function( records:any, cb = (tx:any, result:any) => console.log(result,'ok insertValue'), error = (tx:any, e: any) => console.log("error insertValue",e) ){
      let keysRecords = Object.keys(records || {});
      let lengthKeysRecords = keysRecords.length;

      if( lengthKeysRecords > this.fields.length && lengthKeysRecords < this.fields.length)
        error('Error:',`La cantidad de valores a ingresar no es la misma que los campos de la tabla.\nCampos: ${this.fields} `)
      else if( !records || lengthKeysRecords <= 0 )
        error('Error:','Ingrese un objeto con los valores a ingresar ej; {id:1, data1:2}')
      else{
        this.db.transaction( (tx:any) => {
          let values:string = "";
          let keys:Array<any> = [];
          for (var i = 0; i < lengthKeysRecords; i++) 
            values += (i==0 ? "?" : ", ?"); keys.push( records[keysRecords[i]] );

          tx.executeSql(
            `INSERT INTO ${this.tableName} (${this.fields}) VALUES (${values})`,
            keys,
            cb,
            error
          );
        })
      }
    },
    generateStrings: function(value:any, key:any ):any {
      let vals:Array<any> = [];
      let fds = '';

      if( typeof value == 'object' && value.OR  && value.OR.length > 0 ){
        for (var e = 0; e < value.OR.length; ++e) {
          fds += (e==0 ? `${key} = ? ` : ` OR ${key} = ? `);
          vals.push(value.OR[e]);
        }
      }
      if( typeof value == 'object' && value.AND  && value.AND.length > 0 ){
        for (var e = 0; e < value.AND.length; ++e) {
          fds += (e==0 ? `${key} = ? ` : ` AND ${key} = ? `);
          vals.push(value.AND[e]);
        }
      }
      if( typeof value != 'object' ){
        fds += (e==0 ? `${key} = ? ` : ` AND ${key} = ? `);
        vals.push(value);
      }
      return {vals, fds};
    },
    /*
    * Recive un objeto "records" en el cual se especifica 
    * la key es el campo por el cual se eliminará la data y el valor es 
    * al que tendrá que hacer referencia del campo guardado
    * Ej: { id: 1, data1: 2} = 'WHERE id = 1 AND data1 = 2' o { id: { AND:[1, 2] } } = 'WHERE id = 1 AND id = 2'
    * { id: { OR: [1, 2] }, data2: 2 } = 'WHERE id = 1 OR id = 2 AND data2 = 2'
    */
    deleteValue: function(values:any, cb = (tx:any, result:any) => console.log(result,'ok deleteValue'), error = (tx:any, e: any) => console.log("error deleteValue", e)){
      let keysValues = Object.keys(values || {});
      let lengthKeysValues = keysValues.length;

      if( !values && typeof values != 'object' || lengthKeysValues <= 0 ){
        error('Error:','Ningún campo para eliminar');
      }else{
        let vals:Array<any> = [];
        let fds = '';
        for (var i = 0; i < lengthKeysValues; i++){
          let obj = this.generateStrings(values[keysValues[i]], keysValues[i]);

          fds += obj.fds;
          vals.push(...obj.vals);
          
        }
        
        this.db.transaction( 
          (tx:any) => tx.executeSql(
            `DELETE FROM ${this.tableName} WHERE ${fds}`, 
            vals, 
            cb,
            error
          )
        );
      }
    },
    /*
    * Recive un objeto "records" en el cual se especifica 
    * la key es el campo por el cual se obtendrá la data y el valor es 
    * al que tendrá que hacer referencia del campo guardado, si no se especifica nada se optienen todos los valores
    * Ej: { id: 1, data1: 2} = 'WHERE id = 1 AND data1 = 2' o { id: { AND:[1, 2] } } = 'WHERE id = 1 AND id = 2'
    * { id: { OR: [1, 2] }, data2: 2 } = 'WHERE id = 1 OR id = 2 AND data2 = 2'
    */
    /*
    * Recive un objeto "records" en el cual se especifica 
    * la key es el campo por el cual se obtendrá la data y el valor es 
    * al que tendrá que hacer referencia del campo guardado, si no se especifica nada se optienen todos los valores
    * Ej: { id: 1, data1: 2} = 'WHERE id = 1 AND data1 = 2' o { id: { AND:[1, 2] } } = 'WHERE id = 1 AND id = 2'
    * { id: { OR: [1, 2] }, data2: 2 } = 'WHERE id = 1 OR id = 2 AND data2 = 2'
    */
    /*
    * Recive un objeto "records" en el cual se especifica 
    * la key es el campo por el cual se obtendrá la data y el valor es 
    * al que tendrá que hacer referencia del campo guardado, si no se especifica nada se optienen todos los valores
    * Ej: { id: 1, data1: 2} = 'WHERE id = 1 AND data1 = 2' o { id: { AND:[1, 2] } } = 'WHERE id = 1 AND id = 2'
    * { id: { OR: [1, 2] }, data2: 2 } = 'WHERE id = 1 OR id = 2 AND data2 = 2'
    */
    getValues: function( ):any{
      return function( values:any,  cb = (tx:any, result:any) => console.log(result,'ok getValues'), error = (tx:any, e: any) => console.log( "error getValues",e) ){
        this.db.transaction( (tx:any) => {
          let text:string = `SELECT * FROM ${this.tableName}`;
          let fields = Object.keys(values || {});

          if( values && typeof values != 'object' && fields.length >= 0 ){
            let vals:Array<any> = [];
            let fds = '';
            for (var i = 0; i < fields.length; i++){
              text += (i==0 ? text+` WHERE ${fields[i]} = ? ` : ` AND ${fields[i]} = ?`);
              vals.push(values[fields[i]]);
            }
            tx.executeSql( text, [ vals ], 
              (tx:any, results:any) => {
                if(results.rows.length == 0)
                  cb(tx, {})
                else
                  cb(tx, results.rows)
              }, 
              error
            );
          }else{
            tx.executeSql(
              text, 
              [], 
              (tx:any, results:any) => {
                if(results.rows.length == 0)
                  cb(tx, {})
                else
                  cb(tx, results.rows)
              }, 
              error
            );
          }
        })

      }
    }
    
    
  }
}




let db = SQL({ name: 'DataBase', version:'1.0.0' })
let table: (db:any, obj:any, func:any) => void;
let insertData: (data:Array<any>) => void;

createTable(db, {name:'Ayer', fields:['id','hola','date']}, (tables:any) => {
  table = tables;
  console.log(tables, 'lista de tablas')
  insertData = insertValue(table);
  let getVal = getValues(table);
  getVal();
  // let Id3 = getVal({id:3});

  deleteValue(table, {id: [3,1]})

});

insertData([3,'hola 666', new Date().getTime()])
insertData([3,'hola 777', new Date().getTime()])
insertData([3,'hola 555', new Date().getTime()])


// // Currying (FP pattern)
// function query(dbData: any) {
//   return function (sql: string, args: Array<any> = [], cb = (tx: any, result:any) => { }, error = (e: any) => { }) {
//     dbData.db.transaction((tx: any) => {
//       tx.executeSql(sql, args, cb, error)
//     })
//   }
// }

// function queryAll (dbData: any) {
//   return function (querys: any[]) {
//     dbData.db.transaction((tx: any) => {
//       querys.forEach(q => {
//         // [sql, arguments, callback(tx, res), error]
//         tx.executeSql(
//           q[0],
//           q[1] || [],
//           q[2] || (() => 0),
//           q[3] || (() => 0)
//         )
//       })
//     })
//   }
// }

// let db = SQL({ name: 'robotDB' })

// console.log(db.name)

// let robotQuery = query(db)
// let robotQueryAll = queryAll(db)

// robotQuery('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)')
// robotQuery('INSERT INTO LOGS (id, log) VALUES (1, "foobar")')
// robotQuery('SELECT * FROM LOGS', [], (tx, result) => console.log(result.rows))

// robotQueryAll([
//     ['INSERT INTO LOGS (id, log) VALUES (2, "pru1")'],
//     ['SELECT * FROM LOGS', [], (tx: any, result:any) => console.log(result.rows)],
//     ['INSERT INTO LOGS (id, log) VALUES (3, "pru2")'],
//     ['SELECT * FROM LOGS', [], (tx: any, result:any) => console.log(result.rows)],    
// ])

// robotQueryAll([
//     ['INSERT INTO LOGS (id, log) VALUES (4, "sync1")'],
//     ['SELECT * FROM LOGS', [], (tx: any, result:any) => console.log(result.rows)],
//     ['INSERT INTO LOGS (id, log) VALUES (5, "sync2")'],
//     ['SELECT * FROM LOGS', [], (tx: any, result:any) => console.log(result.rows)],    
// ])

// robotQuery('DROP TABLE LOGS')


