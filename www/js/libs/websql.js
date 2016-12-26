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
})([ function(module, exports) {
    function MakeID(a) {
        var text = "";
        var num = a || 10;
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < num; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    function uuid(a) {
        return a ? (0 | Math.random() * 16).toString(16) : ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, uuid);
    }
    var SQL = function(config) {
        var name = config.name;
        var version = config.version || "1.0.0";
        var description = config.description || "SQL DB";
        var size = config.size || 64 * 1024;
        var idRegistro = config.idRegistro || MakeID(10);
        var idPregunta = config.idPregunta || MakeID(10);
        return {
            name: name,
            version: version,
            description: description,
            size: size,
            db: openDatabase(name, version, description, size)
        };
    };
    function createTable(dbData, params, cb, error) {
        if (cb === void 0) {
            cb = function(obj) {
                return console.log(obj, "ok createTable");
            };
        }
        if (error === void 0) {
            error = function(e) {
                return console.log(e, "error createTable");
            };
        }
        var name = params.name;
        var flds = params.fields;
        var fields = "";
        for (var i = 0; i < flds.length; i++) fields += i == 0 ? flds[i] : ", " + flds[i];
        dbData.db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS " + name + " (" + flds + ")", [], function() {
                return cb({
                    dbData: dbData,
                    fields: fields,
                    name: name
                });
            }, error);
        });
    }
    function insertValue(table, records, cb, error) {
        if (cb === void 0) {
            cb = function(result) {
                return console.log(result, "ok insertValue");
            };
        }
        if (error === void 0) {
            error = function(e) {
                return console.log(e, "error insertValue");
            };
        }
        if (!records || records.length <= 0) error("Ingrese un array con strings de los valores a ingresar"); else {
            table.dbData.db.transaction(function(tx) {
                var values = "";
                for (var i = 0; i < records.length; i++) values += i == 0 ? "?" : ", ?";
                tx.executeSql("INSERT INTO " + table.name + " (" + table.fields + ") VALUES (" + values + ")", records, cb, error);
            });
        }
    }
    function deleteValue(table, values, cb, error) {
        if (cb === void 0) {
            cb = function(tx, result) {
                return console.log(result, "ok deleteValue");
            };
        }
        if (error === void 0) {
            error = function(e) {
                return console.log(e, "error deleteValue");
            };
        }
        var fields = Object.keys(values || {});
        if (!values && typeof values != "object" || fields.length <= 0) {
            error("Not fields to erase");
        } else {
            var vals_1 = [];
            var fds_1 = "";
            for (var i = 0; i < fields.length; i++) {
                if (typeof values[fields[i]] == "object" && values[fields[i]].length > 0) {
                    for (var e = 0; e < values[fields[i]].length; ++e) {
                        fds_1 += e == 0 ? fields[i] + " = ? " : " OR " + fields[i] + " = ? ";
                        vals_1.push(values[fields[i]][e]);
                    }
                } else {
                    fds_1 += i == 0 ? fields[i] + " = ? " : ", " + fields[i] + " = ? ";
                    vals_1.push(values[fields[i]]);
                }
            }
            console.log(fds_1, vals_1, "asdasdasdasdads");
            table.dbData.db.transaction(function(tx) {
                return tx.executeSql("DELETE FROM " + table.name + " WHERE " + fds_1, vals_1, cb, error);
            });
        }
    }
    function getValues(table) {
        return function(values, cb, error) {
            if (cb === void 0) {
                cb = function(tx, result) {
                    return console.log(result, "ok getValues");
                };
            }
            if (error === void 0) {
                error = function(e) {
                    return console.log(e, "error getValues");
                };
            }
            table.dbData.db.transaction(function(tx) {
                var text = "SELECT * FROM " + table.name;
                var fields = Object.keys(values || {});
                if (values && typeof values != "object" && fields.length >= 0) {
                    var vals = [];
                    var fds = "";
                    for (var i = 0; i < fields.length; i++) {
                        text += i == 0 ? text + (" WHERE " + fields[i] + " = ? ") : " AND " + fields[i] + " = ?";
                        vals.push(values[fields[i]]);
                    }
                    tx.executeSql(text, [ vals ], function(tx, results) {
                        if (results.rows.length == 0) cb(tx, {}); else cb(tx, results.rows);
                    }, error);
                } else {
                    tx.executeSql(text, [], function(tx, results) {
                        if (results.rows.length == 0) cb(tx, {}); else cb(tx, results.rows);
                    }, error);
                }
            });
        };
    }
    var db = SQL({
        name: "DataBase",
        version: "1.0.0"
    });
    var table;
    createTable(db, {
        name: "Ayer",
        fields: [ "id", "hola", "date" ]
    }, function(tables) {
        table = tables;
        console.log(tables);
        insertValue(table, [ 1, "hola 666", new Date().getTime() ]);
        insertValue(table, [ 3, "hola 666", new Date().getTime() ]);
        insertValue(table, [ 3, "hola 777", new Date().getTime() ]);
        insertValue(table, [ 3, "hola 555", new Date().getTime() ]);
        var getVal = getValues(table);
        getVal();
        deleteValue(table, {
            id: [ 3, 1 ]
        });
    });
} ]);