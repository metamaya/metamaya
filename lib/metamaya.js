'use strict'

const mm = require("./implementation");


//// module initialization


// create default context
let context = new mm.Context();


//// exports


// methods of the default context can be accessed directly

exports.require = context.require.bind(context);
exports.compile = context.compile.bind(context);
exports.addModule = context.addModule.bind(context);

// free functions

exports.isStrict = mm.isStrict;
exports.isReducible = mm.isReducible;
exports.isFailure = mm.isFailure;

// classes

exports.Context = mm.Context;
exports.Wrapper = mm.Wrapper;
exports.Debugger = mm.Debugger;
exports.Exception = mm.Exception;

// sub-namespaces

exports.prog = mm.prog;
