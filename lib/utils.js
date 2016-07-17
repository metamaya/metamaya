"use strict"

const mm = require('./metamaya');
const util = require("util");


exports.Exception = function Exception(message) {
	this.message = message;
}
exports.Exception.prototype = {
	toString() {
		return this.message;
	}
}

// Customized console logger.
// depth - optional display depth for object trees
exports.log = function(obj, depth) {
	console.log(util.inspect(obj, {
		depth: depth === undefined ? null : depth,
		colors: true,
		breakLength: 120
	}));
}

// shorthands for metamaya object construction

// Binds a function to its arguments.
// head - an applicable object
// args - array of arguments
// options:
//  - rewritable
exports.bind = function(head, args, options) {
	return new mm.Application(head, args, options);
}

// Encloses an expression into a static context.
exports.enclose = function(expr, sc) {
	return new mm.Closure(expr, sc);
}
