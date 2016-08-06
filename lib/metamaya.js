'use strict'

const mm = require("./implementation");


//// module initialization


// create default realm
let realm = new mm.Realm();


//// exports


// methods of the default realm

exports.require = realm.require.bind(realm);
exports.compile = realm.compile.bind(realm);
exports.addModule = realm.addModule.bind(realm);

// free functions

exports.isStrict = mm.isStrict;
exports.isReducible = mm.isReducible;
exports.isFailure = mm.isFailure;
exports.log = mm.log;
exports.toString = mm.toString;

// classes

exports.Realm = mm.Realm;
exports.Debugger = mm.Debugger;
exports.Exception = mm.Exception;

// sub-namespaces

exports.prog = mm.prog;
