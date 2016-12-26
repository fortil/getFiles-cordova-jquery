var R = {
  'map': require('ramda/src/map'),
  'curry': require('ramda/src/curry'),
  'keys': require('ramda/src/keys'),
}

class SQLRecords{
  /*
  @params 
  name: Nombre de la tabla
  description: descripción de la tabla
  size: tamaño de la tabla
  table: un objeto con los siguientes items
    name: nombre de la tabla
    fields: los campos que tendrá la tabla
  app: son los campos por defecto, si los necesita, 
      en los que siempre buscará los registros,
      estos deben de estar dentro de los que la tabla creará
  */
  constructor({name, description, size, app }){
    this.DB = window.openDatabase((name || 'defaultdb'),'1.0.0', (description || 'Default description'), (size || 64 * 1024 ));
    this.fields = '';
    this.app = app || null;
    this.insertValue = R.curry(this.insertValueC);
    this.createTable = R.curry(this.createTableC);
    this.deleteValue = R.curry(this.deleteValueC);
  }
  // Create table
  createTableC( {name, fields}, cb ){
    this.table = {
      name,
      fields
    };
    for (var i = 0; i < this.table.fields.length; i++) {
      this.fields += (i==0 ? this.table.fields[i] : ', '+this.table.fields[i]);
    }
    this.DB.transaction( tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ${this.table.name} (${this.fields})`,
        [],
        () =>{ if(cb) cb( null, 'ok' ) },
        e =>{ if(cb) cb( e, null ) }
      );
    })
  }
  insertValueC( records, cb ){
    if( !records || records.length <= 0 )
      cb(' No records ', null)
    else{
      this.DB.transaction( tx => {
        let values = "";
        for (var i = 0; i < records.length; i++) {
          values += (i==0 ? "?" : ", ?");
        }
        tx.executeSql(
          `INSERT INTO ${this.table.name} (${this.fields}) VALUES (${values})`,
          records,
          () =>{ if(cb) cb( null, 'ok') },
          e =>{ if(cb) cb(e, null ) }
        );
      })
    }
  }
  // values {id:1, path:'file://asdasd/asdas'}
  deleteValueC( values, cb ){
    let fields = Object.keys(values);
    if( typeof values != 'object' || fields.length <= 0 )
      cb('Not fields to erase', null);
    else{
      let vals = [];
      let fds = '';
      for (var i = 0; i < fields.length; i++){
        fds += (i==0 ? fields[i]+" = ?" : ", "+fields[i]+" = ?");
        vals.push(values[fields[i]]);
      }
      
      this.DB.transaction( 
        tx => tx.executeSql(
          `DELETE FROM ${this.table.name} WHERE ${fds}`, 
          vals, 
          () =>{ if(cb) cb( null, 'ok') },
          e =>{ if(cb) cb(e, null ) }
        )
      );
    }
  }
  getAllValues( cb ){
    let values = {};
    this.DB.transaction( tx => {
      tx.executeSql(
        `SELECT * FROM ${this.table.name} WHERE idRegistro = ? AND idPregunta = ?`, 
        [ this.app.idRegistro, this.app.idPregunta ], 
        (tx, results) => {
        if(results.rows.length == 0)
          values = {}
        else
          values = results.rows;
      }, null);
    })
  }
  getAllValuesAsId( cb ){
    this.getAllValues( rows => {
      let keys = Object.keys(rows);
      let values = {};
      if( keys.length > 0){
        for (var i = 0; i < keys.length; i++) {
          values[rows[keys[i]].id] = rows[keys[i]];
        }
      }
      if(cb)
        cb(values)
      else
        return values
    })
  }

  getValuesById( id, cb ){
    this.getValues({ field: 'id', value: id}, cb)
  }
  getValues( {field, value}, cb ){
    let val = {};
    this.DB.transaction( tx => {
      tx.executeSql(`SELECT * FROM ${this.table.name} WHERE ${field} = ? AND idRegistro = ? AND idPregunta = ?`, 
        [value, this.app.idRegistro, this.app.idPregunta], function (tx, results) {
        if(results.rows.length == 0)
          val = {}
        else
          val = results.rows;
        if(cb)
          cb(val)
        else
          return val
      }, null);
    })
  }
  updateValue( {field, value, fieldWhere, valueWhere}, cb ){
    let res = 'error';
    this.DB.transaction( tx => {
      tx.executeSql(`UPDATE ${this.table.name} SET ${field} = ? WHERE ${fieldWhere} = ?`, [value, valueWhere], e => res = 'ok', e => res = 'error' );
      if(cb)
        cb(res)
      else
        return res
    })
  }
  updateValueById( {field, value, id } ){
    this.updateValue( {field, value, fieldWhere: 'id', valueWhere: id}, res => {
      return res
    } )
  }
  
}
function MakeId(a){
  var text = "";
  var num = a || 10;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < num; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function uuid(a){return a?(0|Math.random()*16).toString(16):(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,MakeId)}

// function MakeId( num ){
//   let text = "";
//   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let numero = num || 5
//   for( var i=0; i < numero; i++ )
//     text += possible.charAt(Math.floor(Math.random() * possible.length));

//   return text;
// }
window.Helper = { SQLRecords, MakeId }
export { SQLRecords, MakeId };