"use strict"

const mm = require('./implementation');
const util = require("util");



exports.makeFunction = function makeFunction(options) {
	if (typeof options.invoke !== "function")
		throw new mm.Exception("options must include an invoke() function");

	let f = options.invoke;
	if (typeof options.prepare === "function") {
		f[mm.PrepareInvoke] = options.prepare;
	}
	if (Array.isArray(options.args)) {
		f[mm.Arguments] = options.args;
	}
	return f;
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
