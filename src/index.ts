'use strict'
interface Array<T> {
   equals(o: T): any;
}


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


let consts = {
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
  fileName: "download.json"
}