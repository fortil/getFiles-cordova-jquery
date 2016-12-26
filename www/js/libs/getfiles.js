(function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: false
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";
    return __webpack_require__(0);
})([ function(module, exports, __webpack_require__) {
    "use strict";
    var _keys = __webpack_require__(1);
    var _keys2 = _interopRequireDefault(_keys);
    var _typeof2 = __webpack_require__(36);
    var _typeof3 = _interopRequireDefault(_typeof2);
    var _stringify = __webpack_require__(73);
    var _stringify2 = _interopRequireDefault(_stringify);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Array.prototype.equals = function(array) {
        if (!array) return false;
        if (this.length != array.length) return false;
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] instanceof Array && array[i] instanceof Array) {
                if (!this[i].equals(array[i])) return false;
            } else if (this[i] != array[i]) {
                return false;
            }
        }
        return true;
    };
    Object.defineProperty(Array.prototype, "equals", {
        enumerable: false
    });
    function removeClass(el, cl) {
        el.className = el.className.replace(new RegExp("(\\s+|^)" + cl + "(\\s+|$)", "g"), " ").replace(/^\s+|\s+$/g, "");
    }
    function addClass(el, cl) {
        if (!new RegExp("(\\s|^)" + cl + "(\\s|$)").test(el.className)) {
            el.className += " " + cl;
        }
    }
    function _ref() {
        $(".progress-bar", this).attr("aria-valuenow", "0");
    }
    function _ref6(er, ok) {
        console.log(er, ok);
    }
    function _ref9() {
        $(".progress-bar", this).attr("aria-valuenow", "0");
    }
    function _ref10(result) {
        alert("No hay espacio en el disco");
    }
    function _ref11(progressEvent) {
        if (progressEvent.lengthComputable) {
            $(".progress div.progress-bar").attr("aria-valuenow", progressEvent.loaded / progressEvent.total + "");
        } else {
            console.log("No progress: ");
        }
    }
    function _ref12(error) {
        console.log("download error source " + error.source);
        console.log("download error target " + error.target);
        console.log("download error code " + error.code);
    }
    var Main = {
        cordovaDir: "file:///storage/D62D-1E04/",
        serverName: "http://192.168.0.16/files",
        fileName: "download.json",
        DB: {},
        Files: [],
        JsonVersion: {},
        timer: null,
        reloadView: function reloadView(files) {
            var _this = this;
            var el = $("#ver");
            var ul = $("ul.list-group");
            var lis = $("li", ul);
            $(el).removeClass("btn-info");
            $(el).addClass("btn-success");
            $(el).text("Ver archivos");
            $(lis).remove();
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    $(ul).append('<li class="list-group-item downloaded items-files" data-url="\'' + files[i].path + "'\" onmouseup=\"mouseOutButton('" + files[i].path + "')\" onmousedown=\"mouseOnButton('" + files[i].name + "','" + this.cordovaDir + "')\">" + files[i].name + "</li>");
                }
            } else {
                this.getFiles(function(files) {
                    for (var i = 0; i < files.length; i++) {
                        $(ul).append('<li class="list-group-item downloaded items-files" data-url="\'' + files[i].path + "'\" onmouseup=\"mouseOutButton('" + files[i].path + "')\" onmousedown=\"mouseOnButton('" + files[i].name + "','" + _this.cordovaDir + "')\">" + files[i].name + "</li>");
                    }
                });
            }
        },
        downloadFilesPDFs: function downloadFilesPDFs() {
            var _this2 = this;
            this.getVersion(function(oldFile) {
                _this2.gettingFile(_this2.serverName + "/" + _this2.fileName, function(err, text) {
                    if (text) {
                        _this2.compareVersion(oldFile, JSON.parse(text));
                    }
                });
            });
        },
        downloadingState: function downloadingState(el) {
            $(".list-group li").remove();
            $(el).removeClass("btn-primary");
            $(el).addClass("btn-warning");
            $(el).text("Descargando...");
            $(".progress").show("fast", _ref);
        },
        gettingFile: function gettingFile(route, fn) {
            var data = null;
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange", function() {
                if (this.readyState === 4) fn(null, this.responseText); else fn(false, null);
            });
            xhr.open("GET", route);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.send(data);
        },
        compareVersion: function compareVersion(oldFile, newFile) {
            $(".list-group li").remove();
            if (oldFile == null) {
                this.insertVersion((0, _stringify2.default)(newFile));
                this.downloadFilesBegin(newFile.files);
            } else {
                var json = (typeof oldFile === "undefined" ? "undefined" : (0, _typeof3.default)(oldFile)) == "object" ? oldFile : JSON.parse(oldFile);
                var oV = json.version.split("."), nV = newFile.version.split(".");
                if (!oV.equals(nV)) {
                    this.insertVersion((0, _stringify2.default)(newFile));
                    deletedFiles(this.downloadFilesBegin, newFile.files);
                } else {
                    this.downloadedState($("#download"));
                }
            }
        },
        insertVersion: function insertVersion(v) {
            this.DB.transaction(function(tx) {
                var id = Math.floor(Math.random() * 1e5);
                tx.executeSql("INSERT INTO FILESVERSION (id, json, date ) VALUES (?,?,?)", [ id, v, new Date().getTime() ]);
            });
        },
        deleteFile: function deleteFile(path, cb) {
            function _ref2() {
                cb(null, "ok");
            }
            function _ref3() {
                cb("error", null);
            }
            this.DB.transaction(function(tx) {
                tx.executeSql("DELETE FROM FILES WHERE path = ?", [ path ], _ref2, _ref3);
            });
        },
        insertFile: function insertFile(file) {
            this.DB.transaction(function(tx) {
                var id = Math.floor(Math.random() * 1e5);
                tx.executeSql("INSERT INTO FILES (id , name, path, type, date ) VALUES (?,?,?,?,?)", [ id, file.name, file.fullPath, file.type, new Date().getTime() ]);
            });
        },
        getVersion: function getVersion(cb) {
            var self = this;
            function _ref4(tx, results) {
                var json = {};
                if (results.rows.length == 0 && results.rows[0].json == null) json = {}; else {
                    json = JSON.parse(results.rows[0].json);
                }
                self.JsonVersion = json;
                if (cb) cb(json);
            }
            this.DB.transaction(function(tx) {
                tx.executeSql("SELECT id, json, MAX(date) FROM FILESVERSION", [], _ref4, null);
            });
        },
        getFiles: function getFiles(cb) {
            function _ref5(tx, results) {
                var files = [];
                if (results.rows.length == 0) files = []; else {
                    var keys = (0, _keys2.default)(results.rows);
                    for (var i = 0; i < keys.length; i++) {
                        files.push(results.rows[keys[i]]);
                    }
                }
                if (cb) cb(files);
            }
            this.DB.transaction(function(tx) {
                tx.executeSql("SELECT * FROM FILES", [], _ref5, null);
            });
        },
        initDataBase: function initDataBase(cb) {
            var _this3 = this;
            this.DB = new Helper.SQLRecords({
                name: "files",
                description: "Default description",
                size: 64 * 1024
            });
            this.DB.createTable({
                name: "FILESVERSION",
                fields: [ "id unique", "json", "date" ]
            }, function(e, o) {
                _this3.DB.createTable({
                    name: "FILES",
                    fields: [ "id unique", "name", "path", "type", "date" ]
                }, _ref6);
            });
        },
        toggleVerArchivos: function toggleVerArchivos(el) {
            var lsitGroup = $(".list-group");
            function _ref7() {
                $(el).removeClass("btn-info");
                $(el).addClass("btn-success");
                $(el).text("Ver archivos");
            }
            function _ref8() {
                $(el).removeClass("btn-success");
                $(el).addClass("btn-info");
                $(el).text("Ocultar archivos");
            }
            if (/btn-info/.test(el.className)) {
                $(lsitGroup).hide("100", _ref7);
            } else if (/btn-success/.test(el.className)) {
                $(lsitGroup).show("100", _ref8);
            }
        },
        downloadedState: function downloadedState(el) {
            $(el).removeClass("btn-warning");
            $(el).addClass("btn-primary");
            $(el).text("Download PDFs");
            $(".progress").hide("slow", _ref9);
        },
        setServerName: function setServerName() {
            this.serverName = $("#serverName").val();
        },
        downloadFilesBegin: function downloadFilesBegin(files) {
            var filesJson = [];
            var self = this;
            var countFiles = files.length;
            var stor = window.externalApplicationStorageDirectory || window.PERSISTENT || window.TEMPORARY;
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            var i = 0;
            var vsDisk = function vsDisk() {
                var sizeFiles = 0;
                for (var a = 0; a < countFiles; a++) {
                    sizeFiles += +files[a].size;
                }
                cordova.exec(function(result) {
                    if (result / 1024 >= sizeFiles) alert(" No le queda espacio para almacenar los archivos "); else f(i);
                }, _ref10, "File", "getFreeDiskSpace", []);
            };
            var f = function f(e) {
                var fileTransfer = new FileTransfer();
                var uri = encodeURI(files[e].route);
                var pathToFile = self.cordovaDir + files[e].name;
                fileTransfer.onprogress = _ref11;
                fileTransfer.download(uri, pathToFile, function(entry) {
                    self.insertFile({
                        name: files[e].name,
                        fullPath: entry.nativeURL,
                        type: "pdf"
                    });
                    $("ul.list-group").append('<li class="list-group-item" data-url="\'' + entry.nativeURL + "'\" onmouseup=\"mouseOutButton('" + entry.nativeURL + "')\" onmousedown=\"mouseOnButton('" + files[e].name + "','" + self.cordovaDir + "')\">" + files[e].name + "</li>");
                    e++;
                    if (e < countFiles) {
                        f(e);
                    } else {
                        self.downloadedState($("#download"));
                    }
                }, _ref12, false, {
                    mimeType: "application/pdf"
                });
            };
            vsDisk();
        }
    };
    function mouseOnButton(name, path) {
        Main.timer = setTimeout(function() {
            if (confirm("Desea eliminar el archivo " + name)) {
                deleted(name, path);
            } else {
                mouseOutButton(path + name);
            }
        }, 2e3);
    }
    function _error(e) {
        console.log("Error status: " + e.status + " - Error message: " + e.message);
    }
    function _success() {
        console.log("file opened successfully");
    }
    function mouseOutButton(url) {
        if (Main.timer <= 2e3) {
            clearTimeout(Main.timer);
            cordova.plugins.fileOpener2.open(url, "application/pdf", {
                error: _error,
                success: _success
            });
        }
    }
    function _ref13(e, ok) {
        console.log(e, ok);
    }
    function _ref15(error) {
        alert("No se pudo elimar el archivo ", error);
    }
    function _ref16() {
        Main.reloadView();
        alert("El archivo no existe ", error);
    }
    function deleted(name, path) {
        function _ref14() {
            $('li[data-url*="' + path + name + '"]').remove();
        }
        function _ref17(fileEntry) {
            fileEntry.remove(_ref14, _ref15, _ref16);
        }
        window.resolveLocalFileSystemURL(path, function(dir) {
            Main.deleteFile(path + name, _ref13);
            dir.getFile(name, {
                create: false
            }, _ref17);
        });
    }
    document.addEventListener("deviceready", function() {
        inicialice();
    }, false);
    function inicialice() {
        Main.initDataBase();
        Main.cordovaDir = cordova.file.externalDataDirectory;
    }
    function deletedFiles(fn, argFn) {
        var files = JSON.parse(localStorage.getItem("files")), countFiles;
        if (files != null) {
            countFiles = files.length, i = 0;
            f(i);
        }
        function _ref19(error) {
            if (fn != null && argFn == null) fn(error);
        }
        function _ref20() {
            if (fn != null && argFn == null) fn("no existe el archivo");
        }
        var f = function f(e) {
            function _ref18() {
                e++;
                if (e < countFiles) {
                    f(e);
                } else {
                    if (fn != null && argFn != null) fn(argFn);
                    if (fn != null && argFn == null) fn(" Archivo removido con exito ");
                }
            }
            function _ref21(fileEntry) {
                fileEntry.remove(_ref18, _ref19, _ref20);
            }
            window.resolveLocalFileSystemURL(files[e].route, function(dir) {
                localStorage.removeItem("files");
                dir.getFile(files[e].name + ".pdf", {
                    create: false
                }, _ref21);
            });
        };
    }
}, function(module, exports, __webpack_require__) {
    module.exports = {
        default: __webpack_require__(2),
        __esModule: true
    };
}, function(module, exports, __webpack_require__) {
    __webpack_require__(3);
    module.exports = __webpack_require__(23).Object.keys;
}, function(module, exports, __webpack_require__) {
    var toObject = __webpack_require__(4), $keys = __webpack_require__(6);
    __webpack_require__(21)("keys", function() {
        return function keys(it) {
            return $keys(toObject(it));
        };
    });
}, function(module, exports, __webpack_require__) {
    var defined = __webpack_require__(5);
    module.exports = function(it) {
        return Object(defined(it));
    };
}, function(module, exports) {
    module.exports = function(it) {
        if (it == undefined) throw TypeError("Can't call method on  " + it);
        return it;
    };
}, function(module, exports, __webpack_require__) {
    var $keys = __webpack_require__(7), enumBugKeys = __webpack_require__(20);
    module.exports = Object.keys || function keys(O) {
        return $keys(O, enumBugKeys);
    };
}, function(module, exports, __webpack_require__) {
    var has = __webpack_require__(8), toIObject = __webpack_require__(9), arrayIndexOf = __webpack_require__(12)(false), IE_PROTO = __webpack_require__(16)("IE_PROTO");
    module.exports = function(object, names) {
        var O = toIObject(object), i = 0, result = [], key;
        for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
        while (names.length > i) if (has(O, key = names[i++])) {
            ~arrayIndexOf(result, key) || result.push(key);
        }
        return result;
    };
}, function(module, exports) {
    var hasOwnProperty = {}.hasOwnProperty;
    module.exports = function(it, key) {
        return hasOwnProperty.call(it, key);
    };
}, function(module, exports, __webpack_require__) {
    var IObject = __webpack_require__(10), defined = __webpack_require__(5);
    module.exports = function(it) {
        return IObject(defined(it));
    };
}, function(module, exports, __webpack_require__) {
    var cof = __webpack_require__(11);
    module.exports = Object("z").propertyIsEnumerable(0) ? Object : function(it) {
        return cof(it) == "String" ? it.split("") : Object(it);
    };
}, function(module, exports) {
    var toString = {}.toString;
    module.exports = function(it) {
        return toString.call(it).slice(8, -1);
    };
}, function(module, exports, __webpack_require__) {
    var toIObject = __webpack_require__(9), toLength = __webpack_require__(13), toIndex = __webpack_require__(15);
    module.exports = function(IS_INCLUDES) {
        return function($this, el, fromIndex) {
            var O = toIObject($this), length = toLength(O.length), index = toIndex(fromIndex, length), value;
            if (IS_INCLUDES && el != el) while (length > index) {
                value = O[index++];
                if (value != value) return true;
            } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
                if (O[index] === el) return IS_INCLUDES || index || 0;
            }
            return !IS_INCLUDES && -1;
        };
    };
}, function(module, exports, __webpack_require__) {
    var toInteger = __webpack_require__(14), min = Math.min;
    module.exports = function(it) {
        return it > 0 ? min(toInteger(it), 9007199254740991) : 0;
    };
}, function(module, exports) {
    var ceil = Math.ceil, floor = Math.floor;
    module.exports = function(it) {
        return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
    };
}, function(module, exports, __webpack_require__) {
    var toInteger = __webpack_require__(14), max = Math.max, min = Math.min;
    module.exports = function(index, length) {
        index = toInteger(index);
        return index < 0 ? max(index + length, 0) : min(index, length);
    };
}, function(module, exports, __webpack_require__) {
    var shared = __webpack_require__(17)("keys"), uid = __webpack_require__(19);
    module.exports = function(key) {
        return shared[key] || (shared[key] = uid(key));
    };
}, function(module, exports, __webpack_require__) {
    var global = __webpack_require__(18), SHARED = "__core-js_shared__", store = global[SHARED] || (global[SHARED] = {});
    module.exports = function(key) {
        return store[key] || (store[key] = {});
    };
}, function(module, exports) {
    var global = module.exports = typeof window != "undefined" && window.Math == Math ? window : typeof self != "undefined" && self.Math == Math ? self : Function("return this")();
    if (typeof __g == "number") __g = global;
}, function(module, exports) {
    var id = 0, px = Math.random();
    module.exports = function(key) {
        return "Symbol(".concat(key === undefined ? "" : key, ")_", (++id + px).toString(36));
    };
}, function(module, exports) {
    module.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
}, function(module, exports, __webpack_require__) {
    var $export = __webpack_require__(22), core = __webpack_require__(23), fails = __webpack_require__(32);
    module.exports = function(KEY, exec) {
        var fn = (core.Object || {})[KEY] || Object[KEY], exp = {};
        exp[KEY] = exec(fn);
        $export($export.S + $export.F * fails(function() {
            fn(1);
        }), "Object", exp);
    };
}, function(module, exports, __webpack_require__) {
    var global = __webpack_require__(18), core = __webpack_require__(23), ctx = __webpack_require__(24), hide = __webpack_require__(26), PROTOTYPE = "prototype";
    var $export = function(type, name, source) {
        var IS_FORCED = type & $export.F, IS_GLOBAL = type & $export.G, IS_STATIC = type & $export.S, IS_PROTO = type & $export.P, IS_BIND = type & $export.B, IS_WRAP = type & $export.W, exports = IS_GLOBAL ? core : core[name] || (core[name] = {}), expProto = exports[PROTOTYPE], target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE], key, own, out;
        if (IS_GLOBAL) source = name;
        for (key in source) {
            own = !IS_FORCED && target && target[key] !== undefined;
            if (own && key in exports) continue;
            out = own ? target[key] : source[key];
            exports[key] = IS_GLOBAL && typeof target[key] != "function" ? source[key] : IS_BIND && own ? ctx(out, global) : IS_WRAP && target[key] == out ? function(C) {
                var F = function(a, b, c) {
                    if (this instanceof C) {
                        switch (arguments.length) {
                          case 0:
                            return new C();

                          case 1:
                            return new C(a);

                          case 2:
                            return new C(a, b);
                        }
                        return new C(a, b, c);
                    }
                    return C.apply(this, arguments);
                };
                F[PROTOTYPE] = C[PROTOTYPE];
                return F;
            }(out) : IS_PROTO && typeof out == "function" ? ctx(Function.call, out) : out;
            if (IS_PROTO) {
                (exports.virtual || (exports.virtual = {}))[key] = out;
                if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
            }
        }
    };
    $export.F = 1;
    $export.G = 2;
    $export.S = 4;
    $export.P = 8;
    $export.B = 16;
    $export.W = 32;
    $export.U = 64;
    $export.R = 128;
    module.exports = $export;
}, function(module, exports) {
    var core = module.exports = {
        version: "2.4.0"
    };
    if (typeof __e == "number") __e = core;
}, function(module, exports, __webpack_require__) {
    var aFunction = __webpack_require__(25);
    module.exports = function(fn, that, length) {
        aFunction(fn);
        if (that === undefined) return fn;
        switch (length) {
          case 1:
            return function(a) {
                return fn.call(that, a);
            };

          case 2:
            return function(a, b) {
                return fn.call(that, a, b);
            };

          case 3:
            return function(a, b, c) {
                return fn.call(that, a, b, c);
            };
        }
        return function() {
            return fn.apply(that, arguments);
        };
    };
}, function(module, exports) {
    module.exports = function(it) {
        if (typeof it != "function") throw TypeError(it + " is not a function!");
        return it;
    };
}, function(module, exports, __webpack_require__) {
    var dP = __webpack_require__(27), createDesc = __webpack_require__(35);
    module.exports = __webpack_require__(31) ? function(object, key, value) {
        return dP.f(object, key, createDesc(1, value));
    } : function(object, key, value) {
        object[key] = value;
        return object;
    };
}, function(module, exports, __webpack_require__) {
    var anObject = __webpack_require__(28), IE8_DOM_DEFINE = __webpack_require__(30), toPrimitive = __webpack_require__(34), dP = Object.defineProperty;
    exports.f = __webpack_require__(31) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
        anObject(O);
        P = toPrimitive(P, true);
        anObject(Attributes);
        if (IE8_DOM_DEFINE) try {
            return dP(O, P, Attributes);
        } catch (e) {}
        if ("get" in Attributes || "set" in Attributes) throw TypeError("Accessors not supported!");
        if ("value" in Attributes) O[P] = Attributes.value;
        return O;
    };
}, function(module, exports, __webpack_require__) {
    var isObject = __webpack_require__(29);
    module.exports = function(it) {
        if (!isObject(it)) throw TypeError(it + " is not an object!");
        return it;
    };
}, function(module, exports) {
    module.exports = function(it) {
        return typeof it === "object" ? it !== null : typeof it === "function";
    };
}, function(module, exports, __webpack_require__) {
    module.exports = !__webpack_require__(31) && !__webpack_require__(32)(function() {
        return Object.defineProperty(__webpack_require__(33)("div"), "a", {
            get: function() {
                return 7;
            }
        }).a != 7;
    });
}, function(module, exports, __webpack_require__) {
    module.exports = !__webpack_require__(32)(function() {
        return Object.defineProperty({}, "a", {
            get: function() {
                return 7;
            }
        }).a != 7;
    });
}, function(module, exports) {
    module.exports = function(exec) {
        try {
            return !!exec();
        } catch (e) {
            return true;
        }
    };
}, function(module, exports, __webpack_require__) {
    var isObject = __webpack_require__(29), document = __webpack_require__(18).document, is = isObject(document) && isObject(document.createElement);
    module.exports = function(it) {
        return is ? document.createElement(it) : {};
    };
}, function(module, exports, __webpack_require__) {
    var isObject = __webpack_require__(29);
    module.exports = function(it, S) {
        if (!isObject(it)) return it;
        var fn, val;
        if (S && typeof (fn = it.toString) == "function" && !isObject(val = fn.call(it))) return val;
        if (typeof (fn = it.valueOf) == "function" && !isObject(val = fn.call(it))) return val;
        if (!S && typeof (fn = it.toString) == "function" && !isObject(val = fn.call(it))) return val;
        throw TypeError("Can't convert object to primitive value");
    };
}, function(module, exports) {
    module.exports = function(bitmap, value) {
        return {
            enumerable: !(bitmap & 1),
            configurable: !(bitmap & 2),
            writable: !(bitmap & 4),
            value: value
        };
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    exports.__esModule = true;
    var _iterator = __webpack_require__(37);
    var _iterator2 = _interopRequireDefault(_iterator);
    var _symbol = __webpack_require__(57);
    var _symbol2 = _interopRequireDefault(_symbol);
    var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj;
    };
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function(obj) {
        return typeof obj === "undefined" ? "undefined" : _typeof(obj);
    } : function(obj) {
        return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
    };
}, function(module, exports, __webpack_require__) {
    module.exports = {
        default: __webpack_require__(38),
        __esModule: true
    };
}, function(module, exports, __webpack_require__) {
    __webpack_require__(39);
    __webpack_require__(52);
    module.exports = __webpack_require__(56).f("iterator");
}, function(module, exports, __webpack_require__) {
    "use strict";
    var $at = __webpack_require__(40)(true);
    __webpack_require__(41)(String, "String", function(iterated) {
        this._t = String(iterated);
        this._i = 0;
    }, function() {
        var O = this._t, index = this._i, point;
        if (index >= O.length) return {
            value: undefined,
            done: true
        };
        point = $at(O, index);
        this._i += point.length;
        return {
            value: point,
            done: false
        };
    });
}, function(module, exports, __webpack_require__) {
    var toInteger = __webpack_require__(14), defined = __webpack_require__(5);
    module.exports = function(TO_STRING) {
        return function(that, pos) {
            var s = String(defined(that)), i = toInteger(pos), l = s.length, a, b;
            if (i < 0 || i >= l) return TO_STRING ? "" : undefined;
            a = s.charCodeAt(i);
            return a < 55296 || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343 ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 55296 << 10) + (b - 56320) + 65536;
        };
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var LIBRARY = __webpack_require__(42), $export = __webpack_require__(22), redefine = __webpack_require__(43), hide = __webpack_require__(26), has = __webpack_require__(8), Iterators = __webpack_require__(44), $iterCreate = __webpack_require__(45), setToStringTag = __webpack_require__(49), getPrototypeOf = __webpack_require__(51), ITERATOR = __webpack_require__(50)("iterator"), BUGGY = !([].keys && "next" in [].keys()), FF_ITERATOR = "@@iterator", KEYS = "keys", VALUES = "values";
    var returnThis = function() {
        return this;
    };
    module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
        $iterCreate(Constructor, NAME, next);
        var getMethod = function(kind) {
            if (!BUGGY && kind in proto) return proto[kind];
            switch (kind) {
              case KEYS:
                return function keys() {
                    return new Constructor(this, kind);
                };

              case VALUES:
                return function values() {
                    return new Constructor(this, kind);
                };
            }
            return function entries() {
                return new Constructor(this, kind);
            };
        };
        var TAG = NAME + " Iterator", DEF_VALUES = DEFAULT == VALUES, VALUES_BUG = false, proto = Base.prototype, $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT], $default = $native || getMethod(DEFAULT), $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod("entries") : undefined, $anyNative = NAME == "Array" ? proto.entries || $native : $native, methods, key, IteratorPrototype;
        if ($anyNative) {
            IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
            if (IteratorPrototype !== Object.prototype) {
                setToStringTag(IteratorPrototype, TAG, true);
                if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
            }
        }
        if (DEF_VALUES && $native && $native.name !== VALUES) {
            VALUES_BUG = true;
            $default = function values() {
                return $native.call(this);
            };
        }
        if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
            hide(proto, ITERATOR, $default);
        }
        Iterators[NAME] = $default;
        Iterators[TAG] = returnThis;
        if (DEFAULT) {
            methods = {
                values: DEF_VALUES ? $default : getMethod(VALUES),
                keys: IS_SET ? $default : getMethod(KEYS),
                entries: $entries
            };
            if (FORCED) for (key in methods) {
                if (!(key in proto)) redefine(proto, key, methods[key]);
            } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
        }
        return methods;
    };
}, function(module, exports) {
    module.exports = true;
}, function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(26);
}, function(module, exports) {
    module.exports = {};
}, function(module, exports, __webpack_require__) {
    "use strict";
    var create = __webpack_require__(46), descriptor = __webpack_require__(35), setToStringTag = __webpack_require__(49), IteratorPrototype = {};
    __webpack_require__(26)(IteratorPrototype, __webpack_require__(50)("iterator"), function() {
        return this;
    });
    module.exports = function(Constructor, NAME, next) {
        Constructor.prototype = create(IteratorPrototype, {
            next: descriptor(1, next)
        });
        setToStringTag(Constructor, NAME + " Iterator");
    };
}, function(module, exports, __webpack_require__) {
    var anObject = __webpack_require__(28), dPs = __webpack_require__(47), enumBugKeys = __webpack_require__(20), IE_PROTO = __webpack_require__(16)("IE_PROTO"), Empty = function() {}, PROTOTYPE = "prototype";
    var createDict = function() {
        var iframe = __webpack_require__(33)("iframe"), i = enumBugKeys.length, lt = "<", gt = ">", iframeDocument;
        iframe.style.display = "none";
        __webpack_require__(48).appendChild(iframe);
        iframe.src = "javascript:";
        iframeDocument = iframe.contentWindow.document;
        iframeDocument.open();
        iframeDocument.write(lt + "script" + gt + "document.F=Object" + lt + "/script" + gt);
        iframeDocument.close();
        createDict = iframeDocument.F;
        while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
        return createDict();
    };
    module.exports = Object.create || function create(O, Properties) {
        var result;
        if (O !== null) {
            Empty[PROTOTYPE] = anObject(O);
            result = new Empty();
            Empty[PROTOTYPE] = null;
            result[IE_PROTO] = O;
        } else result = createDict();
        return Properties === undefined ? result : dPs(result, Properties);
    };
}, function(module, exports, __webpack_require__) {
    var dP = __webpack_require__(27), anObject = __webpack_require__(28), getKeys = __webpack_require__(6);
    module.exports = __webpack_require__(31) ? Object.defineProperties : function defineProperties(O, Properties) {
        anObject(O);
        var keys = getKeys(Properties), length = keys.length, i = 0, P;
        while (length > i) dP.f(O, P = keys[i++], Properties[P]);
        return O;
    };
}, function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(18).document && document.documentElement;
}, function(module, exports, __webpack_require__) {
    var def = __webpack_require__(27).f, has = __webpack_require__(8), TAG = __webpack_require__(50)("toStringTag");
    module.exports = function(it, tag, stat) {
        if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, {
            configurable: true,
            value: tag
        });
    };
}, function(module, exports, __webpack_require__) {
    var store = __webpack_require__(17)("wks"), uid = __webpack_require__(19), Symbol = __webpack_require__(18).Symbol, USE_SYMBOL = typeof Symbol == "function";
    var $exports = module.exports = function(name) {
        return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)("Symbol." + name));
    };
    $exports.store = store;
}, function(module, exports, __webpack_require__) {
    var has = __webpack_require__(8), toObject = __webpack_require__(4), IE_PROTO = __webpack_require__(16)("IE_PROTO"), ObjectProto = Object.prototype;
    module.exports = Object.getPrototypeOf || function(O) {
        O = toObject(O);
        if (has(O, IE_PROTO)) return O[IE_PROTO];
        if (typeof O.constructor == "function" && O instanceof O.constructor) {
            return O.constructor.prototype;
        }
        return O instanceof Object ? ObjectProto : null;
    };
}, function(module, exports, __webpack_require__) {
    __webpack_require__(53);
    var global = __webpack_require__(18), hide = __webpack_require__(26), Iterators = __webpack_require__(44), TO_STRING_TAG = __webpack_require__(50)("toStringTag");
    for (var collections = [ "NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList" ], i = 0; i < 5; i++) {
        var NAME = collections[i], Collection = global[NAME], proto = Collection && Collection.prototype;
        if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
        Iterators[NAME] = Iterators.Array;
    }
}, function(module, exports, __webpack_require__) {
    "use strict";
    var addToUnscopables = __webpack_require__(54), step = __webpack_require__(55), Iterators = __webpack_require__(44), toIObject = __webpack_require__(9);
    module.exports = __webpack_require__(41)(Array, "Array", function(iterated, kind) {
        this._t = toIObject(iterated);
        this._i = 0;
        this._k = kind;
    }, function() {
        var O = this._t, kind = this._k, index = this._i++;
        if (!O || index >= O.length) {
            this._t = undefined;
            return step(1);
        }
        if (kind == "keys") return step(0, index);
        if (kind == "values") return step(0, O[index]);
        return step(0, [ index, O[index] ]);
    }, "values");
    Iterators.Arguments = Iterators.Array;
    addToUnscopables("keys");
    addToUnscopables("values");
    addToUnscopables("entries");
}, function(module, exports) {
    module.exports = function() {};
}, function(module, exports) {
    module.exports = function(done, value) {
        return {
            value: value,
            done: !!done
        };
    };
}, function(module, exports, __webpack_require__) {
    exports.f = __webpack_require__(50);
}, function(module, exports, __webpack_require__) {
    module.exports = {
        default: __webpack_require__(58),
        __esModule: true
    };
}, function(module, exports, __webpack_require__) {
    __webpack_require__(59);
    __webpack_require__(70);
    __webpack_require__(71);
    __webpack_require__(72);
    module.exports = __webpack_require__(23).Symbol;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var global = __webpack_require__(18), has = __webpack_require__(8), DESCRIPTORS = __webpack_require__(31), $export = __webpack_require__(22), redefine = __webpack_require__(43), META = __webpack_require__(60).KEY, $fails = __webpack_require__(32), shared = __webpack_require__(17), setToStringTag = __webpack_require__(49), uid = __webpack_require__(19), wks = __webpack_require__(50), wksExt = __webpack_require__(56), wksDefine = __webpack_require__(61), keyOf = __webpack_require__(62), enumKeys = __webpack_require__(63), isArray = __webpack_require__(66), anObject = __webpack_require__(28), toIObject = __webpack_require__(9), toPrimitive = __webpack_require__(34), createDesc = __webpack_require__(35), _create = __webpack_require__(46), gOPNExt = __webpack_require__(67), $GOPD = __webpack_require__(69), $DP = __webpack_require__(27), $keys = __webpack_require__(6), gOPD = $GOPD.f, dP = $DP.f, gOPN = gOPNExt.f, $Symbol = global.Symbol, $JSON = global.JSON, _stringify = $JSON && $JSON.stringify, PROTOTYPE = "prototype", HIDDEN = wks("_hidden"), TO_PRIMITIVE = wks("toPrimitive"), isEnum = {}.propertyIsEnumerable, SymbolRegistry = shared("symbol-registry"), AllSymbols = shared("symbols"), OPSymbols = shared("op-symbols"), ObjectProto = Object[PROTOTYPE], USE_NATIVE = typeof $Symbol == "function", QObject = global.QObject;
    var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
    var setSymbolDesc = DESCRIPTORS && $fails(function() {
        return _create(dP({}, "a", {
            get: function() {
                return dP(this, "a", {
                    value: 7
                }).a;
            }
        })).a != 7;
    }) ? function(it, key, D) {
        var protoDesc = gOPD(ObjectProto, key);
        if (protoDesc) delete ObjectProto[key];
        dP(it, key, D);
        if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
    } : dP;
    var wrap = function(tag) {
        var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
        sym._k = tag;
        return sym;
    };
    var isSymbol = USE_NATIVE && typeof $Symbol.iterator == "symbol" ? function(it) {
        return typeof it == "symbol";
    } : function(it) {
        return it instanceof $Symbol;
    };
    var $defineProperty = function defineProperty(it, key, D) {
        if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
        anObject(it);
        key = toPrimitive(key, true);
        anObject(D);
        if (has(AllSymbols, key)) {
            if (!D.enumerable) {
                if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
                it[HIDDEN][key] = true;
            } else {
                if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
                D = _create(D, {
                    enumerable: createDesc(0, false)
                });
            }
            return setSymbolDesc(it, key, D);
        }
        return dP(it, key, D);
    };
    var $defineProperties = function defineProperties(it, P) {
        anObject(it);
        var keys = enumKeys(P = toIObject(P)), i = 0, l = keys.length, key;
        while (l > i) $defineProperty(it, key = keys[i++], P[key]);
        return it;
    };
    var $create = function create(it, P) {
        return P === undefined ? _create(it) : $defineProperties(_create(it), P);
    };
    var $propertyIsEnumerable = function propertyIsEnumerable(key) {
        var E = isEnum.call(this, key = toPrimitive(key, true));
        if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
        return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
    };
    var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
        it = toIObject(it);
        key = toPrimitive(key, true);
        if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
        var D = gOPD(it, key);
        if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
        return D;
    };
    var $getOwnPropertyNames = function getOwnPropertyNames(it) {
        var names = gOPN(toIObject(it)), result = [], i = 0, key;
        while (names.length > i) {
            if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
        }
        return result;
    };
    var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
        var IS_OP = it === ObjectProto, names = gOPN(IS_OP ? OPSymbols : toIObject(it)), result = [], i = 0, key;
        while (names.length > i) {
            if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
        }
        return result;
    };
    if (!USE_NATIVE) {
        $Symbol = function Symbol() {
            if (this instanceof $Symbol) throw TypeError("Symbol is not a constructor!");
            var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
            var $set = function(value) {
                if (this === ObjectProto) $set.call(OPSymbols, value);
                if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
                setSymbolDesc(this, tag, createDesc(1, value));
            };
            if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, {
                configurable: true,
                set: $set
            });
            return wrap(tag);
        };
        redefine($Symbol[PROTOTYPE], "toString", function toString() {
            return this._k;
        });
        $GOPD.f = $getOwnPropertyDescriptor;
        $DP.f = $defineProperty;
        __webpack_require__(68).f = gOPNExt.f = $getOwnPropertyNames;
        __webpack_require__(65).f = $propertyIsEnumerable;
        __webpack_require__(64).f = $getOwnPropertySymbols;
        if (DESCRIPTORS && !__webpack_require__(42)) {
            redefine(ObjectProto, "propertyIsEnumerable", $propertyIsEnumerable, true);
        }
        wksExt.f = function(name) {
            return wrap(wks(name));
        };
    }
    $export($export.G + $export.W + $export.F * !USE_NATIVE, {
        Symbol: $Symbol
    });
    for (var symbols = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), i = 0; symbols.length > i; ) wks(symbols[i++]);
    for (var symbols = $keys(wks.store), i = 0; symbols.length > i; ) wksDefine(symbols[i++]);
    $export($export.S + $export.F * !USE_NATIVE, "Symbol", {
        for: function(key) {
            return has(SymbolRegistry, key += "") ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
        },
        keyFor: function keyFor(key) {
            if (isSymbol(key)) return keyOf(SymbolRegistry, key);
            throw TypeError(key + " is not a symbol!");
        },
        useSetter: function() {
            setter = true;
        },
        useSimple: function() {
            setter = false;
        }
    });
    $export($export.S + $export.F * !USE_NATIVE, "Object", {
        create: $create,
        defineProperty: $defineProperty,
        defineProperties: $defineProperties,
        getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
        getOwnPropertyNames: $getOwnPropertyNames,
        getOwnPropertySymbols: $getOwnPropertySymbols
    });
    $JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function() {
        var S = $Symbol();
        return _stringify([ S ]) != "[null]" || _stringify({
            a: S
        }) != "{}" || _stringify(Object(S)) != "{}";
    })), "JSON", {
        stringify: function stringify(it) {
            if (it === undefined || isSymbol(it)) return;
            var args = [ it ], i = 1, replacer, $replacer;
            while (arguments.length > i) args.push(arguments[i++]);
            replacer = args[1];
            if (typeof replacer == "function") $replacer = replacer;
            if ($replacer || !isArray(replacer)) replacer = function(key, value) {
                if ($replacer) value = $replacer.call(this, key, value);
                if (!isSymbol(value)) return value;
            };
            args[1] = replacer;
            return _stringify.apply($JSON, args);
        }
    });
    $Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(26)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
    setToStringTag($Symbol, "Symbol");
    setToStringTag(Math, "Math", true);
    setToStringTag(global.JSON, "JSON", true);
}, function(module, exports, __webpack_require__) {
    var META = __webpack_require__(19)("meta"), isObject = __webpack_require__(29), has = __webpack_require__(8), setDesc = __webpack_require__(27).f, id = 0;
    var isExtensible = Object.isExtensible || function() {
        return true;
    };
    var FREEZE = !__webpack_require__(32)(function() {
        return isExtensible(Object.preventExtensions({}));
    });
    var setMeta = function(it) {
        setDesc(it, META, {
            value: {
                i: "O" + ++id,
                w: {}
            }
        });
    };
    var fastKey = function(it, create) {
        if (!isObject(it)) return typeof it == "symbol" ? it : (typeof it == "string" ? "S" : "P") + it;
        if (!has(it, META)) {
            if (!isExtensible(it)) return "F";
            if (!create) return "E";
            setMeta(it);
        }
        return it[META].i;
    };
    var getWeak = function(it, create) {
        if (!has(it, META)) {
            if (!isExtensible(it)) return true;
            if (!create) return false;
            setMeta(it);
        }
        return it[META].w;
    };
    var onFreeze = function(it) {
        if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
        return it;
    };
    var meta = module.exports = {
        KEY: META,
        NEED: false,
        fastKey: fastKey,
        getWeak: getWeak,
        onFreeze: onFreeze
    };
}, function(module, exports, __webpack_require__) {
    var global = __webpack_require__(18), core = __webpack_require__(23), LIBRARY = __webpack_require__(42), wksExt = __webpack_require__(56), defineProperty = __webpack_require__(27).f;
    module.exports = function(name) {
        var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
        if (name.charAt(0) != "_" && !(name in $Symbol)) defineProperty($Symbol, name, {
            value: wksExt.f(name)
        });
    };
}, function(module, exports, __webpack_require__) {
    var getKeys = __webpack_require__(6), toIObject = __webpack_require__(9);
    module.exports = function(object, el) {
        var O = toIObject(object), keys = getKeys(O), length = keys.length, index = 0, key;
        while (length > index) if (O[key = keys[index++]] === el) return key;
    };
}, function(module, exports, __webpack_require__) {
    var getKeys = __webpack_require__(6), gOPS = __webpack_require__(64), pIE = __webpack_require__(65);
    module.exports = function(it) {
        var result = getKeys(it), getSymbols = gOPS.f;
        if (getSymbols) {
            var symbols = getSymbols(it), isEnum = pIE.f, i = 0, key;
            while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
        }
        return result;
    };
}, function(module, exports) {
    exports.f = Object.getOwnPropertySymbols;
}, function(module, exports) {
    exports.f = {}.propertyIsEnumerable;
}, function(module, exports, __webpack_require__) {
    var cof = __webpack_require__(11);
    module.exports = Array.isArray || function isArray(arg) {
        return cof(arg) == "Array";
    };
}, function(module, exports, __webpack_require__) {
    var toIObject = __webpack_require__(9), gOPN = __webpack_require__(68).f, toString = {}.toString;
    var windowNames = typeof window == "object" && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
    var getWindowNames = function(it) {
        try {
            return gOPN(it);
        } catch (e) {
            return windowNames.slice();
        }
    };
    module.exports.f = function getOwnPropertyNames(it) {
        return windowNames && toString.call(it) == "[object Window]" ? getWindowNames(it) : gOPN(toIObject(it));
    };
}, function(module, exports, __webpack_require__) {
    var $keys = __webpack_require__(7), hiddenKeys = __webpack_require__(20).concat("length", "prototype");
    exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
        return $keys(O, hiddenKeys);
    };
}, function(module, exports, __webpack_require__) {
    var pIE = __webpack_require__(65), createDesc = __webpack_require__(35), toIObject = __webpack_require__(9), toPrimitive = __webpack_require__(34), has = __webpack_require__(8), IE8_DOM_DEFINE = __webpack_require__(30), gOPD = Object.getOwnPropertyDescriptor;
    exports.f = __webpack_require__(31) ? gOPD : function getOwnPropertyDescriptor(O, P) {
        O = toIObject(O);
        P = toPrimitive(P, true);
        if (IE8_DOM_DEFINE) try {
            return gOPD(O, P);
        } catch (e) {}
        if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
    };
}, function(module, exports) {}, function(module, exports, __webpack_require__) {
    __webpack_require__(61)("asyncIterator");
}, function(module, exports, __webpack_require__) {
    __webpack_require__(61)("observable");
}, function(module, exports, __webpack_require__) {
    module.exports = {
        default: __webpack_require__(74),
        __esModule: true
    };
}, function(module, exports, __webpack_require__) {
    var core = __webpack_require__(23), $JSON = core.JSON || (core.JSON = {
        stringify: JSON.stringify
    });
    module.exports = function stringify(it) {
        return $JSON.stringify.apply($JSON, arguments);
    };
} ]);