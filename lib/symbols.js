"use strict"

const mm = require("./metamaya");

exports.NonValue = Symbol.for("org.metamaya.Symbol.NonValue");
exports.NotFound = Symbol.for("org.metamaya.Symbol.NotFound");
exports.StaticContext = 'mm-staticContext'; // Symbol.for("org.metamaya.Symbol.StaticContext");

// symbol properties

exports.Args = 'mm-args'; // Symbol.for("org.metamaya.Symbol.Args");
exports.TestArgs = 'mm-testArgs'; // Symbol.for("org.metamaya.Symbol.TestArgs");
exports.Apply = 'mm-apply'; // Symbol.for("org.metamaya.Symbol.Apply");
exports.Normalize = 'mm-normalize'; // Symbol.for("org.metamaya.Symbol.Normalize");

// note: names are temporarily substituted for symbols because of a problem
// with the V8 debugger, see: https://github.com/nodejs/node/issues/7536

