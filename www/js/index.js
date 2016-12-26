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
  strings: {
    errorDownloadJSON: 'Hubo un error en la descarga, revise su conexción a internet.',
    isCurrentVersion: 'La versión actual de los archivos es la más reciente.',
    notFreeSpace: 'No hay espacio suficiente en el disco para la descarga de archivos.',
    notFreeSpaceClean: 'No hay espacio suficiente en el disco.',
    downloading: 'Descargando...',
    downloaded: 'Download PDFs',
  },
  elems:{
    download: '#download',
    lis: 'ul.list-group li',
    ul: 'ul.list-group',
    serverName: '#serverName',
    progressBar: '.progress div.progress-bar',
    ver: '#ver',
    ver: '#ver',
  },
  cordovaDir:'file:///storage/D62D-1E04/',
  serverName: 'http://192.168.4.88/files/', //siempre debe de llevar el slash / a lo último
  fileName: "download.json",
  DB: {},
  Files:[],
  JsonVersion: {},
  timer: null,
  downloadingState: function( ) {
    // $('.list-group li').remove()
    var self = this;
    $(this.elems.download).removeClass('btn-primary')
      .addClass('btn-warning')
      .text(self.strings.downloading)
    this.addProgressBar( {total: 100, loaded:0 } );
  },
  downloadedState: function ( txt) {
    var self = this;
    $(this.elems.download).removeClass('btn-warning').addClass('btn-primary').text(this.strings.downloaded);

    this.addProgressBar( {total: 100, loaded:0 } );
    if( txt ){
      window.plugins.toast.showWithOptions(
        {
          message: txt,
          duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
          position: "bottom",
          addPixelsY: -40,  // added a negative value to move it up a bit (default 0)
          styling: {
            opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
            backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
            textColor: '#FFFF00', // Ditto. Default #FFFFFF
            textSize: 20.5, // Default is approx. 13.
            cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
            horizontalPadding: 20, // iOS default 16, Android default 50
            verticalPadding: 16 // iOS default 12, Android default 30
          }
        },
        function(e){console.log(e)}, // optional
        function(e){console.log(e)}    // optional
      );
    }
  },
  setServerName: function ( cb ) {
    this.serverName =  $(this.elems.serverName).val()
  },
  promptError: function( error ){
    alert("download error source " + error.source+"\n"+"download error target " + error.target+"\n"+"download error code " + error.code);
  },
  addProgressBar: function( obj ){
    $(this.elems.progressBar)
      .attr('aria-valuemax', (obj.total) +'')
      .attr('aria-valuenow', (obj.loaded / obj.total) +'');
  },
  prompMsj: function( str ){ alert(str); },
  downloadFilesPDFs: function( ) {
    var self = this;
    this.getVersion(function( oldFile ){
      self.gettingFile( self.serverName+self.fileName , function(err, text) {
        if( text && !/\<\?xml/.test(text)){
          console.log(oldFile, JSON.parse(text),' downloadFilesPDFs' )
          self.compareVersion(oldFile, JSON.parse(text));
        }else if( err && text == null){
          self.prompMsj(self.strings.errorDownloadJSON+'\n'+err);
        }
      })

    })
  },
  checkDisk: function ( sizeFiles, cb ){
    var self = this;
    cordova.exec( function(result) {
      if((result / 1024) <= sizeFiles){
        cb( null )
        self.prompMsj(self.strings.notFreeSpaceClean+'\n'+'Libere '+((result / 1024) - sizeFiles)+' MB de espacio para realizar la descarga.');
      }else{
        cb( true )
      }
    }, function(result)  {
      cb( null );
      self.prompMsj(self.strings.notFreeSpace);
    }, "File", "getFreeDiskSpace", [])
  },
  gettingFile: function(route, fn) {
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function() {
      console.log( this.readyState )
      if (this.readyState === 4) 
        fn( null, this.responseText )
      // else
      //   fn( this.responseText, null )
    });
    xhr.open("GET", route );
    xhr.setRequestHeader("cache-control", "no-cache");
    // xhr.setRequestHeader("dataType", "json");
    xhr.send(data);
  },
  reloadView: function( files ){
    var self = this;
    var el = $(this.elems.ver);
    var ul = $(this.elems.ul)
    var lis = $(this.elems.lis)

    $(el).removeClass('btn-info')
      .addClass('btn-success')
      .text('Ver archivos')
    $(lis).remove()

    if( files ){
      for (var i = 0; i < files.length; i++) {
        this.addLiFile(files[i])
      }
    }else{
      this.getFiles(function( files ){
        for (var i = 0; i < files.length; i++) {
          self.addLiFile(files[i])
        }
      })
    }
  },
  compareVersion: function(oldFile, newFile) {
    var self = this

    var oldFile = typeof oldFile == 'object'? oldFile : (oldFile != null )? JSON.parse(oldFile) : oldFile,
        newFile = typeof newFile == 'object'? newFile : JSON.parse(newFile),
        newFileKeys = Object.keys(newFile) ,
        newFileLength = newFileKeys.length,
        newVerCount = 0,
        sizeFiles = 0;

    for (var a = 0; a < newFileLength; a++) {
      sizeFiles += (+newFile[newFileKeys[a]].size)
    }

    this.checkDisk(sizeFiles, function( pass ){
      
      if( pass != null ){
        $(self.elems.lis).remove()

        if( oldFile == null ){
          self.insertVersion( JSON.stringify(newFile) )
          for (var i = 0; i < newFileLength; i++) {
            var fileDownload = newFile[newFileKeys[i]];
            self.downloadFileBegin( fileDownload, function( file ){
              self.insertFile( file )
              self.addLiFile( file );
              self.downloadedState( file.name+' descargado.' );
            });
          }
        }else{
          for (var i = 0; i < newFileLength; i++) {
            var oV = (oldFile[newFileKeys[i]] && oldFile[newFileKeys[i]].version ? oldFile[newFileKeys[i]].version : '0.0.0').split('.'),
              nV = (newFile[newFileKeys[i]] && newFile[newFileKeys[i]].version ? newFile[newFileKeys[i]].version : '0.0.0').split('.'),
              fileDownload = newFile[newFileKeys[i]];

            if( !oV.equals(nV) ){
              newVerCount ++;
              self.downloadFileBegin(fileDownload , function( file ){
                self.updateFile( file )
                self.removeLiFile( file );
                self.addLiFile( file );
                self.downloadedState( file.name+' descargado.'  )
              });
            }
          }

          if( newVerCount > 0 ){
            self.insertVersion( JSON.stringify(newFile) )
          }else{
            self.reloadView();
            self.prompMsj(self.strings.isCurrentVersion);
            self.downloadedState( );
          }
        }
      }else{
        self.downloadedState( );
      }
    })
  },
  insertVersion: function( v ){
    this.DB.transaction( function(tx) {
      var id = Math.floor(Math.random() * 100000)
      tx.executeSql('INSERT INTO FILESVERSION (id, json, date ) VALUES (?,?,?)',[id,v,new Date().getTime()]);
    })
  },
  deleteFile: function( id, cb ){
    this.DB.transaction( function(tx) {
      tx.executeSql('DELETE FROM FILES WHERE id = ?',[ id ], function(){cb(null,'ok')}, function(){cb('error',null)})
    })
  },
  deleteVersion: function(){
    this.db.transaction( function(tx) {
      tx.executeSql('SELECT id, MAX(date) FROM FILESVERSION',[], function(tx,results){
        if(results.rows.length >= 0 && results.rows[0].id != null){
          this.DB.transaction( function(tx) {
            tx.executeSql('DELETE FROM FILESVERSION WHERE id = ?',[ results.rows[0].id ], function(){console.log(null,'ok')}, function(){console.log('error',null)})
          })
        }
      }, function(tx,err){console.log(tx,err,'errr')})
    })
  },
  updateFile: function( file ){
    this.DB.transaction( function(tx) {
      tx.executeSql('UPDATE FILES SET (fullPath, version, date ) VALUES (?,?,?) WHERE id = ? ',
        [file.fullPath, file.version, new Date().getTime(),file.id]);
    })
  },
  insertFile: function( file ){
    this.DB.transaction( function(tx) {
      tx.executeSql('INSERT INTO FILES (id , name, fullPath, type, version, date ) VALUES (?,?,?,?,?,?)',
        [file.id, file.name, file.fullPath, file.type, file.version, new Date().getTime()]);
    })
  },
  getVersion: function( cb ) {
    var self = this;
    this.DB.transaction( function(tx) {
      tx.executeSql('SELECT id, json, MAX(date) FROM FILESVERSION', [], function (tx, results) {
        var json = {};
        if(results.rows.length == 0 && results.rows[0].json == null)
          json = null;
        else
          json = JSON.parse(results.rows[0].json)
        
        self.JsonVersion = json;
        if( cb )
          cb( json );

      }, function(tx,err){
        self.prompMsj(tx,err)
      })
    })
  },
  getFiles: function( cb ) {
    var self = this;
    this.DB.transaction( function(tx) {
      tx.executeSql('SELECT * FROM FILES', [], function (tx, results) {
        var files = [];

        if(results.rows.length > 0){
          var keys = Object.keys(results.rows);
          for (var i = 0; i < keys.length; i++) {
            files.push(results.rows[keys[i]])
          }
        }
        if( cb )
          cb( files );
      }, function(tx, e){
        self.prompMsj(JSON.stringify(tx)+': \n'+JSON.stringify(e))
      })
    });
  },
  initDataBase: function ( cb ) {
    this.DB = window.openDatabase('files','1.0.0', 'Default description', 64 * 1024 );
    this.DB.transaction( function( tx ) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS FILESVERSION (id unique, json, date )');
      tx.executeSql('CREATE TABLE IF NOT EXISTS FILES (id unique, name, fullPath, type, version, date )');
      if( cb )
        cb( );
    })
  },
  toggleVerArchivos: function( ){
    var lsitGroup = $(this.elems.ul);
    var el = $(this.elems.ver);

    if( el.hasClass('btn-info') ){
      $(lsitGroup).hide('100', function() {
        $(el).removeClass('btn-info')
          .addClass('btn-success')
          .text('Ver archivos')
      });
    }else if( el.hasClass('btn-success') ){
      $(lsitGroup).show('100', function() {
        $(el).removeClass('btn-success')
          .addClass('btn-info')
          .text('Ocultar archivos')
      });
    }
  },
  downloadFileBegin: function( file, cb ) {
    var self = this,
      stor = window.externalApplicationStorageDirectory || window.PERSISTENT || window.TEMPORARY,
      pathToFile = self.cordovaDir + file.name;

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
    this.downloadingState();

    setTimeout(function(){
      var fileTransfer = new FileTransfer();
      var uri = encodeURI( file.route );
      // Estado de inicio de descarga

      fileTransfer.onprogress = function(progressEvent) {
        if (progressEvent.lengthComputable) {
          self.addProgressBar( progressEvent );
        } else {
          self.addProgressBar( {total: 100, loaded:0 } );
        }
      };

      fileTransfer.download(
        uri,
        pathToFile,
        function(entry) {
          if( cb )
            cb({id: file.id, name: file.name , fullPath: entry.nativeURL, type: 'pdf', version: file.version })
        },
        function(err){
          self.deleteVersion();
          self.promptError(err)
        },
        false,
        { mimeType: "application/pdf" }
      );
    }, 1);

  },
  deleted : function( file ) {
    var self = this;
    window.resolveLocalFileSystemURL(this.cordovaDir, function(dir) {
      dir.getFile(file.name, { create: false }, 
        function(fileEntry) {
          fileEntry.remove(function () {
            self.deleteFile(file.id, function(){
              self.removeLiFile( file )
            })
          }, function(error) {
            alert('No se pudo elimar el archivo ',error);
          },function () {
            Main.reloadView();
            alert('El archivo no existe ',error);
          });
      });
    });
  },
  addLiFile: function( file ){
    var self = this;
    $('ul.list-group').append('<li data-id="'+file.id+'" class="'+file.id+' list-group-item" data-url="\''+ 
          file.fullPath +'\'" data-name="'+ file.name +'" '+
          'data-cordovadir="'+ this.cordovaDir +'" >'+ 
          file.name +'</li>')
    $('li[data-id*="'+file.id+'"]').mousedown(function(evt){
      evt.preventDefault();
      self.mouseOnButton(file)
    })
    $('li[data-id*="'+file.id+'"]').mouseup(function(evt){
      evt.preventDefault();
      self.mouseOutButton(file)
    })
  },
  removeLiFile: function( file ){
    $('li[data-id*="'+file.id+'"].'+file.id).remove()
  },
  mouseOnButton: function ( file ){
    var self = this
    this.timer = true;
    setTimeout( function(){ 
      if(self.timer == true){
        self.timer = false;
        if(confirm('Desea eliminar el archivo '+file.name)){
          self.deleted( file )
        }else{
          self.mouseOutButton( file );
        }
      }
    }, 2000 );
  },
  mouseOutButton: function( file ){
    var self = this
    if( this.timer ){
      self.timer = false;
      cordova.plugins.fileOpener2.open(
        file.fullPath,
        'application/pdf', 
        { 
          error : function( e ){ self.prompMsj('Error status: ' + e.status + ' - Error message: ' + e.message)},
          success : function() { self.prompMsj('file opened successfully')}
        }
      );
    }
  }

}




document.addEventListener('deviceready', function() { inicialice() }, false);


function inicialice(){


  Main.initDataBase();
  Main.cordovaDir = cordova.file.externalDataDirectory;

  // Se puede obtener los archivos guardados en la DB
  Main.getFiles( function( files ){
    Main.reloadView( files )
  });

  // Ver archivos
  $('#ver').click(function(evt){
    evt.preventDefault();
    Main.toggleVerArchivos( $(this) )
  })

  // descargar archivos
  $('#download').click(function(evt){
    evt.preventDefault();
    Main.downloadingState( $(this) )
    Main.downloadFilesPDFs( )
  })
  // setServername
  $('#setServer').click(function(evt){
    evt.preventDefault();
    Main.setServerName();
  })

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

