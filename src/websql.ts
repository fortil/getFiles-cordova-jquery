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
  let idRegistro:string = config.idRegistro || MakeID(10);
  let idPregunta:string = config.idPregunta || MakeID(10);
  return {
    name,
    version,
    description,
    size,
    db: openDatabase(name, version, description, size),
  }
}

function createTable(dbData:any, params:any, cb = (obj:any) => console.log(obj,'ok createTable'), error = (e: any) => console.log(e,'error createTable')){
  let name: any = params.name;
  let flds: Array<string> = params.fields;
  let fields: string = '';

  for (var i = 0; i < flds.length; i++)
    fields += (i==0 ? flds[i] : ', '+flds[i]);

  dbData.db.transaction( (tx:any) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ${name} (${flds})`,
      [],
      ()=>cb({dbData, fields, name}),
      error
    );
  })
}
function insertValue(table:any, records:Array<any>, cb = (result:any) => console.log(result,'ok insertValue'), error = (e: any) => console.log(e, "error insertValue")){
  if( !records || records.length <= 0 )
    error('Ingrese un array con strings de los valores a ingresar')
  else{
    table.dbData.db.transaction( (tx:any) => {
      let values:string = "";
      for (var i = 0; i < records.length; i++) 
        values += (i==0 ? "?" : ", ?");

      tx.executeSql(
        `INSERT INTO ${table.name} (${table.fields}) VALUES (${values})`,
        records,
        cb,
        error
      );
    })
  }
}

function deleteValue(table:any, values:any, cb = (tx:any, result:any) => console.log(result,'ok deleteValue'), error = (e: any) => console.log(e, "error deleteValue")){
  let fields = Object.keys(values || {});
  if( !values && typeof values != 'object' || fields.length <= 0 ){
    error('Not fields to erase');
  }else{
    let vals:Array<any> = [];
    let fds = '';
    for (var i = 0; i < fields.length; i++){
      if( typeof values[fields[i]]=='object' && values[fields[i]].length > 0){
        for (var e = 0; e < values[fields[i]].length; ++e) {
          fds += (e==0 ? `${fields[i]} = ? ` : ` OR ${fields[i]} = ? `);
          // fds += `AND ${fields[i]} = ? `;
          vals.push(values[fields[i]][e]);
        }
      }else{
        fds += (i==0 ? `${fields[i]} = ? ` : `, ${fields[i]} = ? `);
        vals.push(values[fields[i]]);
      }
    }
    
    console.log(fds,vals,'asdasdasdasdads')
    table.dbData.db.transaction( 
      (tx:any) => tx.executeSql(
        `DELETE FROM ${table.name} WHERE ${fds}`, 
        vals, 
        cb,
        error
      )
    );
  }
}

function getValues(table:any ):any{
  return function( values:any,  cb = (tx:any, result:any) => console.log(result,'ok getValues'), error = (e: any) => console.log(e, "error getValues") ){
    table.dbData.db.transaction( (tx:any) => {
      let text:string = `SELECT * FROM ${table.name}`;
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

let db = SQL({ name: 'DataBase', version:'1.0.0' })
let table: any;
createTable(db, {name:'Ayer', fields:['id','hola','date']}, (tables:any) => {
  table = tables;
  console.log(tables)
  insertValue(table,[1,'hola 666', new Date().getTime()])
  insertValue(table,[3,'hola 666', new Date().getTime()])
  insertValue(table,[3,'hola 777', new Date().getTime()])
  insertValue(table,[3,'hola 555', new Date().getTime()])
  let getVal = getValues(table);
  getVal();
  // let Id3 = getVal({id:3});

  deleteValue(table, {id: [3,1]})

});

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


