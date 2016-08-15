"use strict"

const mm = require('./implementation');
const util = require("util");


// Class of metamaya exceptions.
exports.Exception = function Exception(message) {
	this.message = message;
}
exports.Exception.prototype = {
	toString() {
		return this.message;
	}
}
