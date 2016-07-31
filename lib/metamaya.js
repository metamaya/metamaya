'use strict'

const mm = require("./implementation");

// default realm

let realm = new mm.Realm();
exports.require = realm.require.bind(realm);
exports.compile = realm.compile.bind(realm);
exports.addModule = realm.addModule.bind(realm);

// free functions

exports.isStrict = mm.isStrict;
exports.isReducible = mm.isReducible;
exports.isFailure = mm.isFailure;
exports.log = mm.log;

// classes

exports.Realm = mm.Realm;
exports.Debugger = mm.Debugger;
exports.Exception = mm.Exception;

// sub-namespaces

exports.prog = mm.prog;
