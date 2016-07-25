"use strict"

const mm = require('./metamaya');
const util = require("util");


// shorthands for metamaya actions

// Returns the strict value of an expression in an environment.
// Throws if the expression cannot be strictly evaluated in the environment.
exports.eval = function eval_(expr, env) {
	return new mm.Evaluator(env).eval(expr);
}

// Strictly evaluates an object property.
// When called with a plain js object, it simply returns the property.
exports.evalProperty = function evalProperty(obj, key) {
	return mm.eval(obj[key], obj);
}

// Customized console logger.
// obj - object to dump
// depth - optional display depth for object trees
exports.log = function(obj, depth) {
	console.log(util.inspect(obj, {
		depth: depth === undefined ? null : depth,
		colors: true,
		breakLength: 78
	}));
}

// Class of metamaya exceptions.
exports.Exception = function Exception(message) {
	this.message = message;
}
exports.Exception.prototype = {
	toString() {
		return this.message;
	}
}
