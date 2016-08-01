"use strict"

const mm = require('./implementation');
const util = require("util");


// Customized console logger.
// obj - object to dump
// depth - optional display depth for object trees
exports.log = function(obj, depth) {
	console.log(mm.toString(obj, depth));
}


// Converts an object to formatted string.
// obj - object to convert
// depth - optional display depth for object trees
exports.toString = function(obj, depth) {
	return util.inspect(obj, {
		depth: depth === undefined ? null : depth,
		colors: true,
		breakLength: 78
	});
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
