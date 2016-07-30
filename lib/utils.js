"use strict"

const mm = require('./metamaya');
const util = require("util");


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
