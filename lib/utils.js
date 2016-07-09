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
		colors: true
	}));
}

// shorthands for metamaya object construction

exports.apply = function(head, args) {
	return new mm.Application(head, args);
}