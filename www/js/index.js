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
  counters:{},
  strings: {
    errorDownloadJSON: 'Hubo un error en la descarga, revise su conexión a internet.',
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
    parentProgressBar: '.progress',
    progressBar: '.progress div.progress-bar',
    ver: '#ver',
  },
  cordovaDir:'file:///storage/D62D-1E04/',
  serverName: 'http://192.168.0.16/files/', //siempre debe de llevar el slash / a lo último
  fileName: "download.json",
  DB: {},
  Files:[],
  JsonVersion: {},
  timer: null,
  views:{
    hideFiles: function( ){
      var lsitGroup = $(Main.elems.ul);
      var el = $(Main.elems.ver);
      $(lsitGroup).hide('100', function() {
        $(el).removeClass('btn-info').addClass('btn-success').text('Ver archivos')
      });
    },
    showFiles: function( ){
      var lsitGroup = $(Main.elems.ul);
      var el = $(Main.elems.ver);
      $(lsitGroup).show('100', function() {
        $(el).removeClass('btn-success').addClass('btn-info').text('Ocultar archivos')
      });
    },
    toogleFiles: function( ){
      var lsitGroup = $(Main.elems.ul);
      var el = $(Main.elems.ver);

      if( el.hasClass('btn-info') ){
        Main.views.hideFiles()
      }else if( el.hasClass('btn-success') ){
        Main.views.showFiles()
      }
    },
    initDownloading: function( ) {
      Main.views.hideFiles();
      $(Main.elems.download).removeClass('btn-primary').addClass('btn-warning').text(Main.strings.downloading)
      Main.views.addProgressBar( {total:100, loaded:0, show:true } );
    },
    finishDownload: function ( txt) {
      var self = this;
      $(Main.elems.download).removeClass('btn-warning').addClass('btn-primary').text(Main.strings.downloaded);

      Main.views.addProgressBar( {total: 100, loaded:0, show:false} );
      if( txt ){
        Main.views.tooltipMSJ(txt);
      }
    },
    addProgressBar: function( obj ){
      $(Main.elems.parentProgressBar).css('display',(obj.show == true ? 'show': 'none'));
      $(Main.elems.progressBar)
        .attr('aria-valuemax', (obj.total) +'')
        .attr('aria-valuenow', (obj.loaded / obj.total) +'')
        .css('width',((obj.loaded*100) / obj.total)+'%')
    },
    tooltipMSJ: function( txt ){
      window.plugins.toast.showWithOptions(
        {
          message: (typeof txt == 'object'? JSON.stringify(txt) : txt) ,
          duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
          position: "bottom",
          addPixelsY: -40,  // added a negative value to move it up a bit (default 0)
          // styling: {
          //   opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
          //   backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
          //   textColor: '#FFFF00', // Ditto. Default #FFFFFF
          //   textSize: 20.5, // Default is approx. 13.
          //   cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
          //   horizontalPadding: 20, // iOS default 16, Android default 50
          //   verticalPadding: 16 // iOS default 12, Android default 30
          // }
        },
        function(e){console.log(e)}, // optional
        function(e){console.log(e)}    // optional
      );
    },
    prompMsj: function( str ){ alert(str); },
    removeFile: function( file ){
      $('li[data-id*="'+file.id+'"].'+file.id).remove()
    },
    addFile: function( file ){
      $('ul.list-group').append('<li class="list-group-item '+file.id+'" data-id="'+
            file.id+'" data-url="\''+ 
            file.fullPath +'\'" data-name="'+ file.name +'" '+
            'data-cordovadir="'+ this.cordovaDir +'" >'+ 
            file.name +'</li>')
      $('li[data-id*="'+file.id+'"]').mousedown(function(evt){
        evt.preventDefault();
        Main.actions.mouseOnButton(file);
      })
      $('li[data-id*="'+file.id+'"]').mouseup(function(evt){
        evt.preventDefault();
        Main.actions.mouseOutButton(file);
      })
    }
  },
  actions:{
    deleted : function( file ) {
      window.resolveLocalFileSystemURL(Main.cordovaDir, function(dir) {
        dir.getFile(file.name, { create: false }, 
          function(fileEntry) {
            fileEntry.remove(function () {
              Main.deleteFileDB(file.id, function(){
                Main.views.removeFile( file )
              })
            }, function(error) {
              Main.views.prompMsj('mouseOutButton: \n'+'No se pudo elimar el archivo \n'+(typeof error=='object'? JSON.stringify(error) : error));
              alert('No se pudo elimar el archivo ',error);
            },function () {
              Main.reloadView();
              Main.views.prompMsj('mouseOutButton: \n'+'No se pudo elimar el archivo \n'+(typeof error=='object'? JSON.stringify(error) : error));
            });
        });
      });
    },
    mouseOnButton: function ( file ){
      Main.timer = true;
      setTimeout( function(){ 
        if(Main.timer == true){
          Main.timer = false;
          if(confirm('Desea eliminar el archivo '+file.name)){
            Main.actions.deleted( file )
          }else{
            Main.actions.mouseOutButton( file );
          }
        }
      }, 2000 );
    },
    mouseOutButton: function( file ){
      if( Main.timer ){
        Main.timer = false;
        cordova.plugins.fileOpener2.open(
          file.fullPath,
          'application/pdf', 
          { 
            error : function( e ){ Main.views.prompMsj('mouseOutButton: \n'+'Error status: ' + e.status + ' - Error message: ' + e.message)},
            success : function() { Main.views.prompMsj('mouseOutButton: \n'+'file opened successfully')}
          }
        );
      }
    },
    setServerName: function ( ) {
      Main.serverName =  $(Main.elems.serverName).val()
      Main.reloadView();
    },
    checkDisk: function ( sizeFiles, cb ){
      var self = this;
      cordova.exec( function(result) {
        if((result / 1024) <= sizeFiles){
          cb( null )
          Main.views.prompMsj('checkDisk: \n'+Main.strings.notFreeSpaceClean+'\n'+'Libere '+((result / 1024) - sizeFiles)+' MB de espacio para realizar la descarga.');
        }else{
          cb( true )
        }
      }, function(result)  {
        cb( null );
        Main.views.prompMsj('checkDisk: \n'+Main.strings.notFreeSpace);
      }, "File", "getFreeDiskSpace", [])
    },
  },
  initDB: function ( cb ) {
    this.DB = window.openDatabase('files','1.0.0', 'Default description', 64 * 1024 );
    this.DB.transaction( function( tx ) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS FILES (id unique, name, fullPath, type, version, date )');
      if( cb )
        cb( );
    })
  },
  getFilesDB: function( cb, obj ) {
    var self = this;
    this.DB.transaction( function(tx) {
      tx.executeSql('SELECT * FROM FILES', [], function (tx, results) {
        var files = obj==true? null : [];
        if(results.rows.length > 0){
          if( obj ){
            var keys = Object.keys(results.rows);
            files = {};
            for (var i = 0; i < keys.length; i++) {
              files[ results.rows[keys[i]].name ] = results.rows[keys[i]]
            }
          }else{
            var keys = Object.keys(results.rows);
            for (var i = 0; i < keys.length; i++) {
              files.push(results.rows[keys[i]])
            }
          }
        }
        if( cb )
          cb( files );
      }, function(tx, e){
        Main.views.prompMsj('getFilesDB: \n'+JSON.stringify(tx)+': \n'+JSON.stringify(e))
      })
    });
  },
  deleteFileDB: function( id, cb ){
    this.DB.transaction( function(tx) {
      tx.executeSql('DELETE FROM FILES WHERE id = ?',[ id ], function(){cb(null,'ok')}, function(){cb('error',null)})
    })
  },
  updateFileDB: function( file ){
    this.DB.transaction( function(tx) {
      tx.executeSql('UPDATE FILES SET name = ?, fullPath = ?, version = ?, date = ? WHERE id = ?',
        [file.name, file.fullPath, file.version, new Date().getTime(),file.id],function(tx,rs){
          console.log(tx,rs)
        },function(tx,err){
          console.log(tx,err)
        });
    })
  },
  insertFileDB: function( file ){
    this.DB.transaction( function(tx) {
      tx.executeSql('INSERT INTO FILES (id , name, fullPath, type, version, date ) VALUES (?,?,?,?,?,?)',
        [file.id, file.name, file.fullPath, file.type, file.version, new Date().getTime()]);
    })
  },
  reloadView: function( files ){
    var el = $(Main.elems.ver);
    var ul = $(Main.elems.ul)
    var lis = $(Main.elems.lis)
    $(lis).remove()

    if( files ){
      for (var i = 0; i < files.length; i++) {
        Main.views.addFile(files[i])
      }
    }else{
      Main.getFilesDB(function( files ){
        for (var i = 0; i < files.length; i++) {
          Main.views.addFile(files[i])
        }
      })
    }
    Main.views.hideFiles();
    Main.views.finishDownload();
  },
  initDownloadFiles: function( ) {
    var self = this;
    self.getFileServerJson( self.serverName+self.fileName , function( text ) {
      self.getFilesDB(function( oldFile ){
        setTimeout(function(){
          self.compareVersion(oldFile, (typeof text == 'object'? text : JSON.parse(text)));
        },1);
      }, true);
    })
  },
  getFileServerJson: function(route, fn) {
    var timeout = true;
    var ajax = $.ajax({
      url: route+'?_=' + new Date().getTime()
    })
    .done(function(res) {
      timeout = false
      fn( res )
    })
    .fail(function( err ) {
      Main.views.finishDownload();
      var text = Main.strings.errorDownloadJSON+'\n';
      if( err.responseText )
        text += err.responseText.replace(/\n/ig,"").replace(/(<([^>]+)>)/ig,"")

      Main.views.prompMsj('getFileServerJson: \n'+text);
    })
    setTimeout(function(){
      if( timeout == true )
        ajax.abort();
    }, 10000)
  },
  compareVersion: function(oldFile, newFile) {
    var self = this

    var oldFile = typeof oldFile == 'object'? oldFile : JSON.parse(oldFile),
        newFile = typeof newFile == 'object'? newFile : JSON.parse(newFile),
        newFileKeys = Object.keys(newFile) ,
        newFileLength = newFileKeys.length,
        // newVerCount = 0,
        sizeFiles = 0;

    // for (var a = 0; a < newFileLength; a++) {
    //   sizeFiles += (+newFile[newFileKeys[a]].size)
    // }

    var filesToDownload = {updates:[], inserts:[]};

    for (var i = 0; i < newFileLength; i++) {
      var fileDownload = newFile[newFileKeys[i]];
      var fileOld = oldFile ? oldFile[newFileKeys[i]] : null;

      if( fileOld && !(fileDownload.version.split('.')).equals(fileOld.version.split('.')) )
        filesToDownload.updates.push( fileDownload );
      else if( !fileOld ) 
        filesToDownload.inserts.push( fileDownload );
      
    }

    if( filesToDownload.updates.length > 0 ){
      for (var a = 0; a < filesToDownload.updates.length; a++)
        sizeFiles += (+filesToDownload.updates[a].size);
    }else if( filesToDownload.inserts.length > 0 ){
      for (var a = 0; a < filesToDownload.inserts.length; a++)
        sizeFiles += (+filesToDownload.inserts[a].size);
    }

    if( sizeFiles > 0 ){
      Main.actions.checkDisk(sizeFiles, function( pass ){
        
        if( pass != null ){

          if( filesToDownload.updates.length > 0 ){
            var i = 0;

            var fnUpdate = function( e ) {

              var fileDownload = filesToDownload.updates[e];

              self.downloadFileServer( fileDownload, function( file ){

                self.updateFileDB( file );
                Main.views.finishDownload( file.name+' actualizado.' );
                e += 1;
                if( e < filesToDownload.updates.length )
                  fnUpdate( e )
                else{
                  self.reloadView();
                  Main.views.finishDownload('Todos los archivos actualizados.' );
                }

              });

            }

            fnUpdate(i)

            // for (var i = 0; i < filesToDownload.updates.length; i++) {
            // }
          }
          if( filesToDownload.inserts.length > 0 ){
            var a = 0;

            var fnInsert = function( e ) {

              var fileDownload = filesToDownload.inserts[e];

              self.downloadFileServer( fileDownload, function( file ){

                self.insertFileDB( file );
                Main.views.tooltipMSJ( file.name+' descargado.' );
                e += 1;
                if( e < filesToDownload.inserts.length )
                  fnInsert( e )
                else{
                  self.reloadView();
                  Main.views.finishDownload('Todos los archivos nuevos descargados.' );
                }


              });

            }

            fnInsert(a);
            // for (var i = 0; i < filesToDownload.updates.length; i++) {
            //   filesToDownload.updates[i]
            //   var fileDownload = filesToDownload.updates[i];
            //   self.downloadFileServer( fileDownload, function( file ){
            //     self.insertFileDB( file );
            //     Main.views.finishDownload( file.name+' descargado.' );
            //     I ++;
            //   }, self);
            // }
          }
        }

      })
    }else{
      Main.views.finishDownload();
      Main.views.prompMsj('compareVersion: \n'+Main.strings.isCurrentVersion);
    }   

    // Main.actions.checkDisk(sizeFiles, function( pass ){
      
    //   if( pass != null ){
    //     for (var i = 0; i < newFileLength; i++) {
    //       var fileDownload = newFile[newFileKeys[i]];
    //       var fileOld = oldFile ? oldFile[newFileKeys[i]] : null;

    //       if( fileOld && !(fileDownload.version.split('.')).equals(fileOld.version.split('.')) ){
    //         newVerCount ++;
    //         Main.views.initDownloading();
    //         self.downloadFileServer( fileDownload, function( file ){
    //           self.updateFileDB( file );
    //           self.reloadView();
    //           Main.views.finishDownload( file.name+' descargado.' );
    //         });
    //       }else if( !fileOld ) {
    //         newVerCount ++;
    //         Main.views.initDownloading();
    //         self.downloadFileServer( fileDownload, function( file ){
    //           self.insertFileDB( file );
    //           self.reloadView();
    //           Main.views.finishDownload( file.name+' descargado.' );
    //         });
    //       }

    //     }

    //     if( newVerCount <= 0 ){
    //       Main.views.prompMsj('compareVersion: \n'+Main.strings.isCurrentVersion);
    //     }
    //   }

    //   Main.views.finishDownload( );
    // })
  },
  downloadFileServer: function( file, cb ) {
    var stor = window.externalApplicationStorageDirectory || window.PERSISTENT || window.TEMPORARY,
      pathToFile = Main.cordovaDir + file.name;

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem

    
    var fileTransfer = new FileTransfer();
    var uri = encodeURI( file.route );
    // Estado de inicio de descarga

    fileTransfer.onprogress = function(progressEvent) {
      if (progressEvent.lengthComputable) {
        progressEvent.show = true;
        Main.views.addProgressBar( progressEvent );
      } else {
        Main.views.addProgressBar( {total: 100, loaded:0, show:false } );
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
        Main.views.prompMsj('FileTransfer: \n'+JSON.stringify(err));
        Main.views.finishDownload( );
      },
      false,
      { mimeType: "application/pdf" }
    );
  },  

}




document.addEventListener('deviceready', function() { inicialice() }, false);


function inicialice(){


  Main.initDB();
  Main.cordovaDir = cordova.file.externalDataDirectory;

  // Se puede obtener los archivos guardados en la DB
  Main.getFilesDB( function( files ){
    Main.reloadView( files )
  });

  // Ver archivos
  $('#ver').click(function(evt){
    evt.preventDefault();
    Main.views.toogleFiles()
  })

  // descargar archivos
  $('#download').click(function(evt){
    evt.preventDefault();
    Main.views.initDownloading()
    Main.initDownloadFiles( )
  })
  // Set in the input nameserver
  $('#serverName').val(Main.serverName)
  // setServername
  $('#setServer').click(function(evt){
    evt.preventDefault();
    Main.actions.setServerName();
  })

}


