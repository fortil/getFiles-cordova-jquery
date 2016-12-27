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
        var tableName = null;
        var fields = "";
        return {
            name: name,
            version: version,
            description: description,
            size: size,
            tableName: tableName,
            fields: fields,
            db: openDatabase(name, version, description, size),
            createTable: function(params, cb, error) {
                if (cb === void 0) {
                    cb = function(obj) {
                        return console.log(obj, "ok createTable");
                    };
                }
                if (error === void 0) {
                    error = function(tx, e) {
                        return console.log("error createTable", e);
                    };
                }
                this.tableName = params.name;
                var flds = params.fields;
                for (var i = 0; i < flds.length; i++) this.fields += i == 0 ? flds[i] : ", " + flds[i];
                this.db.transaction(function(tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS " + name + " (" + flds + ")", [], function(tx, res) {
                        return cb({
                            name: name,
                            res: res
                        });
                    }, error);
                });
            },
            insertValue: function(records, cb, error) {
                var _this = this;
                if (cb === void 0) {
                    cb = function(tx, result) {
                        return console.log(result, "ok insertValue");
                    };
                }
                if (error === void 0) {
                    error = function(tx, e) {
                        return console.log("error insertValue", e);
                    };
                }
                var keysRecords = Object.keys(records || {});
                var lengthKeysRecords = keysRecords.length;
                if (lengthKeysRecords > this.fields.length && lengthKeysRecords < this.fields.length) error("Error:", "La cantidad de valores a ingresar no es la misma que los campos de la tabla.\nCampos: " + this.fields + " "); else if (!records || lengthKeysRecords <= 0) error("Error:", "Ingrese un objeto con los valores a ingresar ej; {id:1, data1:2}"); else {
                    this.db.transaction(function(tx) {
                        var values = "";
                        var keys = [];
                        for (var i = 0; i < lengthKeysRecords; i++) values += i == 0 ? "?" : ", ?";
                        keys.push(records[keysRecords[i]]);
                        tx.executeSql("INSERT INTO " + _this.tableName + " (" + _this.fields + ") VALUES (" + values + ")", keys, cb, error);
                    });
                }
            },
            generateStrings: function(value, key) {
                var vals = [];
                var fds = "";
                if (typeof value == "object" && value.OR && value.OR.length > 0) {
                    for (var e = 0; e < value.OR.length; ++e) {
                        fds += e == 0 ? key + " = ? " : " OR " + key + " = ? ";
                        vals.push(value.OR[e]);
                    }
                }
                if (typeof value == "object" && value.AND && value.AND.length > 0) {
                    for (var e = 0; e < value.AND.length; ++e) {
                        fds += e == 0 ? key + " = ? " : " AND " + key + " = ? ";
                        vals.push(value.AND[e]);
                    }
                }
                if (typeof value != "object") {
                    fds += e == 0 ? key + " = ? " : " AND " + key + " = ? ";
                    vals.push(value);
                }
                return {
                    vals: vals,
                    fds: fds
                };
            },
            deleteValue: function(values, cb, error) {
                var _this = this;
                if (cb === void 0) {
                    cb = function(tx, result) {
                        return console.log(result, "ok deleteValue");
                    };
                }
                if (error === void 0) {
                    error = function(tx, e) {
                        return console.log("error deleteValue", e);
                    };
                }
                var keysValues = Object.keys(values || {});
                var lengthKeysValues = keysValues.length;
                if (!values && typeof values != "object" || lengthKeysValues <= 0) {
                    error("Error:", "Ningún campo para eliminar");
                } else {
                    var vals_1 = [];
                    var fds_1 = "";
                    for (var i = 0; i < lengthKeysValues; i++) {
                        var obj = this.generateStrings(values[keysValues[i]], keysValues[i]);
                        fds_1 += obj.fds;
                        vals_1.push.apply(vals_1, obj.vals);
                    }
                    this.db.transaction(function(tx) {
                        return tx.executeSql("DELETE FROM " + _this.tableName + " WHERE " + fds_1, vals_1, cb, error);
                    });
                }
            },
            getValues: function() {
                return function(values, cb, error) {
                    var _this = this;
                    if (cb === void 0) {
                        cb = function(tx, result) {
                            return console.log(result, "ok getValues");
                        };
                    }
                    if (error === void 0) {
                        error = function(tx, e) {
                            return console.log("error getValues", e);
                        };
                    }
                    this.db.transaction(function(tx) {
                        var text = "SELECT * FROM " + _this.tableName;
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
        };
    };
    var db = SQL({
        name: "DataBase",
        version: "1.0.0"
    });
    var table;
    var insertData;
    createTable(db, {
        name: "Ayer",
        fields: [ "id", "hola", "date" ]
    }, function(tables) {
        table = tables;
        console.log(tables, "lista de tablas");
        insertData = insertValue(table);
        var getVal = getValues(table);
        getVal();
        deleteValue(table, {
            id: [ 3, 1 ]
        });
    });
    insertData([ 3, "hola 666", new Date().getTime() ]);
    insertData([ 3, "hola 777", new Date().getTime() ]);
    insertData([ 3, "hola 555", new Date().getTime() ]);
} ]);