'use strict'

Array.prototype.equals = function (array) {
  if (!array)
    return false;

  if (this.length != array.length)
    return false;

  for (var i = 0, l=this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i]))
        return false;       
    }           
    else if (this[i] != array[i]) { 
      return false;   
    }           
  }       
  return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function removeClass(el, cl) {
  el.className = el.className.replace(new RegExp('(\\s+|^)'+cl+'(\\s+|$)', 'g'), ' ').replace(/^\s+|\s+$/g, '');
}
function addClass(el, cl) {
  if (!new RegExp('(\\s|^)'+cl+'(\\s|$)').test(el.className)) {
    el.className += ' ' + cl;
  }
}
var Main = {
  cordovaDir:'file:///storage/D62D-1E04/',
  serverName: 'http://192.168.4.88/files',
  fileName: "download.json",
  DB: {},
  Files:[],
  JsonVersion: {},
  timer: null,
  reloadView: function( files ){
    var self = this;
    var el = $('#ver');
    var ul = $('ul.list-group')
    var lis = $('li', ul)

    $(el).removeClass('btn-info')
    $(el).addClass('btn-success')
    $(el).text('Ver archivos')
    $(lis).remove()

    if( files ){
      for (var i = 0; i < files.length; i++) {
        $(ul).append('<li class="list-group-item" data-url="\''+ files[i].path +'\'" onmouseup="mouseOutButton(\''+ files[i].path +'\')" onmousedown="mouseOnButton(\''+ files[i].name +'\',\''+ this.cordovaDir +'\')">'+ files[i].name +'</li>')
        // $(ul).append('<li class="list-group-item" onclick="openFile(\''+ files[i].path +'\')">'+ files[i].name +'</li>')
      }
    }else{
      this.getFiles(function( files ){
        for (var i = 0; i < files.length; i++) {
          $(ul).append('<li class="list-group-item" data-url="\''+ files[i].path +'\'" onmouseup="mouseOutButton(\''+ files[i].path +'\')" onmousedown="mouseOnButton(\''+ files[i].name +'\',\''+ self.cordovaDir +'\')">'+ files[i].name +'</li>')
        }
      })
    }
  },
  downloadFilesPDFs: function( ) {
    var self = this;
    this.getVersion(function( oldFile ){
      self.gettingFile( self.serverName+"/"+self.fileName , function(err, text) {
        if(text){
          self.compareVersion(oldFile, JSON.parse(text))
        }
      })

    })
  },
  downloadingState: function( el) {
    // var ul = document.getElementById("ulMessages");
    // while((var lis = ul.getElementsByTagName("li")).length > 0) {
    //   ul.removeChild(lis[0]);
    // }
    $('.list-group li').remove()
    $(el).removeClass('btn-primary')
    $(el).addClass('btn-warning')
    $(el).text('Descargando...')
    $('.progress').show('fast', function() {
      $('.progress-bar', this).attr('aria-valuenow', '0');
    });

  },
  gettingFile: function(route, fn) {
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) 
        fn( null, this.responseText )
      else
        fn( false, null )
    });
    xhr.open("GET", route );
    xhr.setRequestHeader("cache-control", "no-cache");
    // xhr.setRequestHeader("dataType", "json");
    xhr.send(data);
  },
  compareVersion: function(oldFile, newFile) {

    $('.list-group li').remove()

    if( oldFile==null ){
      this.insertVersion( JSON.stringify(newFile) )
      this.downloadFilesBegin( newFile.files )
    }else{
      var json = typeof oldFile == 'object'? oldFile : JSON.parse(oldFile);
      var oV = json.version.split('.'),
          nV = newFile.version.split('.');
      if( !oV.equals(nV) ){
        this.insertVersion( JSON.stringify(newFile) )
        deletedFiles( this.downloadFilesBegin, newFile.files )
      }else{
        this.downloadedState( $('#download') )
      }

    }
    
  },
  insertVersion: function( v ){
    this.DB.transaction( function(tx) {
      var id = Math.floor(Math.random() * 100000)
      tx.executeSql('INSERT INTO FILESVERSION (id, json, date ) VALUES (?,?,?)',[id,v,new Date().getTime()]);
    })
  },
  deleteFile: function( path, cb ){
    this.DB.transaction( function(tx) {
      tx.executeSql('DELETE FROM FILES WHERE path = ?',[ path ], function(){cb(null,'ok')}, function(){cb('error',null)})
    })
  },
  insertFile: function( file ){
    this.DB.transaction( function(tx) {
      var id = Math.floor(Math.random() * 100000)
      tx.executeSql('INSERT INTO FILES (id , name, path, type, date ) VALUES (?,?,?,?,?)',
        [id,file.name, file.fullPath, file.type, new Date().getTime()]);
    })
  },
  getVersion: function( cb ) {
    var self = this;
    this.DB.transaction( function(tx) {
      tx.executeSql('SELECT id, json, MAX(date) FROM FILESVERSION', [], function (tx, results) {
        var json = {};

        if(results.rows.length == 0 && results.rows[0].json == null)
          json = {};
        else{
          json = JSON.parse(results.rows[0].json)
        }
        self.JsonVersion = json;
        if( cb )
          cb( json );
      }, null)
    })
  },
  getFiles: function( cb ) {
    this.DB.transaction( function(tx) {
      tx.executeSql('SELECT * FROM FILES', [], function (tx, results) {
        var files = [];

        if(results.rows.length == 0)
          files = []
        else{
          var keys = Object.keys(results.rows);
          for (var i = 0; i < keys.length; i++) {
            files.push(results.rows[keys[i]])
          }
        }
        if( cb )
          cb( files );
      }, null)
    });
  },
  initDataBase: function ( cb ) {
    this.DB = window.openDatabase('files','1.0.0', 'Default description', 64 * 1024 );
    this.DB.transaction( function( tx ) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS FILESVERSION (id unique, json, date )');
      tx.executeSql('CREATE TABLE IF NOT EXISTS FILES (id unique, name, path, type, date )');
      if( cb )
        cb( );
    })
  },
  toggleVerArchivos: function( el ){
    var lsitGroup = $('.list-group');

    if( /btn-info/.test(el.className) ){
      $(lsitGroup).hide('100', function() {
        $(el).removeClass('btn-info')
        $(el).addClass('btn-success')
        $(el).text('Ver archivos')
      });
    }else if( /btn-success/.test(el.className) ){
      $(lsitGroup).show('100', function() {
        $(el).removeClass('btn-success')
        $(el).addClass('btn-info')
        $(el).text('Ocultar archivos')
      });
    }
  },
  downloadedState: function (el) {
    $(el).removeClass('btn-warning')
    $(el).addClass('btn-primary')
    // removeClass(el, 'btn-warning');
    // addClass(el, 'btn-primary');
    $(el).text('Download PDFs');
    
    $('.progress').hide('slow', function() {
      $('.progress-bar', this).attr('aria-valuenow', '0');
    });

  },
  setServerName: function () {
    this.serverName =  $('#serverName').val()
  },
  downloadFilesBegin: function( files ) {
    var filesJson = [];
    var self = this;
    var countFiles = files.length;
    var stor = window.externalApplicationStorageDirectory || window.PERSISTENT || window.TEMPORARY
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem

    var i = 0;

    var vsDisk = function (){
      var sizeFiles = 0;
      for (var a = 0; a < countFiles; a++) {
        sizeFiles += +files[a].size
      }

      cordova.exec( function(result) {
        if((result / 1024) >= sizeFiles)
          alert(' No le queda espacio para almacenar los archivos ')
        else
          f(i)
      }, function(result)  {
        alert('No hay espacio en el disco')
      }, "File", "getFreeDiskSpace", [])
      
    }


    var f = function(e) {

      var fileTransfer = new FileTransfer();
      var uri = encodeURI( files[e].route );
      var pathToFile = self.cordovaDir + files[e].name;

      fileTransfer.onprogress = function(progressEvent) {
        if (progressEvent.lengthComputable) {
          $('.progress div.progress-bar').attr('aria-valuenow', (progressEvent.loaded / progressEvent.total) +'');
        } else {
          console.log('No progress: ')
        }
      };

      fileTransfer.download(
        uri,
        pathToFile,
        function(entry) {
          self.insertFile({name: files[e].name , fullPath: entry.nativeURL, type: 'pdf' })

          $('ul.list-group')
            .append('<li class="list-group-item" data-url="\''+ entry.nativeURL +'\'" onmouseup="mouseOutButton(\''+ entry.nativeURL +'\')" onmousedown="mouseOnButton(\''+ files[e].name +'\',\''+ self.cordovaDir +'\')">'+ files[e].name +'</li>')

          e ++
          if( e < countFiles ){
            f(e)
          }else{
            self.downloadedState( $('#download') )
          }

        },
        function(error) {
          console.log("download error source " + error.source);
          console.log("download error target " + error.target);
          console.log("download error code " + error.code);
        },
        false,
        { mimeType: "application/pdf" }
      );

    }

    vsDisk()
    
  },
}

function mouseOnButton( name, path ){
  Main.timer = setTimeout( function(){ 
    if(confirm('Desea eliminar el archivo '+name)){
      deleted(name, path)
    }else{
      mouseOutButton(path+name );
    }
  }, 2000 );
}
function mouseOutButton ( url ){
  if( Main.timer <= 2000 ){
    clearTimeout( Main.timer );
    cordova.plugins.fileOpener2.open(
      url,
      'application/pdf', 
      { 
        error : function( e ){console.log('Error status: ' + e.status + ' - Error message: ' + e.message)},
        success : function() {console.log('file opened successfully')}
      }
    );
  }
}
function deleted( name, path ) {
  window.resolveLocalFileSystemURL(path, function(dir) {
    Main.deleteFile( path+name, function(e,ok){ console.log(e,ok) });
    dir.getFile(name, { create: false }, 
      function(fileEntry) {
        fileEntry.remove(function () {
          $('li[data-url*="'+path+name+'"]').remove()
        }, function(error) {
          alert('No se pudo elimar el archivo ',error);
        },function () {
          Main.reloadView();
          alert('El archivo no existe ',error);
        });
    });
  });
}


document.addEventListener('deviceready', function() { inicialice() }, false);


function inicialice(){


  Main.initDataBase();
  Main.cordovaDir = cordova.file.externalDataDirectory;
  // se puede obtener en una variable global el archivo json 
  // más reciente guardado en la DB
  Main.getVersion( function( json ){
    
  });
  // Se puede obtener los archivos guardados en la DB
  Main.getFiles( function( files ){
    Main.reloadView( files )
  });

  // Ver archivos
  var verDocsElement = document.getElementById('ver')
  verDocsElement.addEventListener('click', function() {
    Main.toggleVerArchivos( verDocsElement )
  }, false );

  // descargar archivos
  var downloadDocs = document.getElementById('download')
  downloadDocs.addEventListener('click', function() {
    Main.downloadingState( downloadDocs )
    setTimeout(function(){ Main.downloadFilesPDFs( )},0)
  }, false );
  var setServer = document.getElementById('setServer');
  setServer.addEventListener('click', function(){ Main.setServerName() }, false)
  setServer.value = Main.serverName;

  // document.getElementById('borrar').addEventListener('click', function(){ Main.deletedFiles() }, false)
  // Opcional de borrar todos los archivos
  // $('#borrar').click(function(event) {
  //   $('.list-group li').remove()
  //   localStorage.removeItem('fileVersion')
  //   deletedFiles()
  // });
}

function deletedFiles( fn, argFn ) {
  var files = JSON.parse(localStorage.getItem('files')),
      countFiles;

  if(files != null){
    countFiles = files.length,
            i = 0;
    
    f(i)
  }
  let f = function(e ) {
    window.resolveLocalFileSystemURL(files[e].route, function(dir) {
      localStorage.removeItem('files')
      dir.getFile(files[e].name+'.pdf', { create: false }, function(fileEntry) {
                  fileEntry.remove(function () {
                    e ++;
                    if( e < countFiles ){
                      f(e)
                    }else{
                      if( fn != null && argFn != null )
                        fn( argFn )
                      if( fn != null && argFn == null )
                        fn( ' Archivo removido con exito ' )
                    }
                      
                  }, function(error) {
                    if( fn != null && argFn == null )
                      fn( error )
                  },function () {
                    if( fn != null && argFn == null )
                      fn( 'no existe el archivo' )
                  });
      });
    });
  }

}

