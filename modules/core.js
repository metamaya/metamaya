"use strict"

const mm = require("../lib/metamaya");

let coreModule = mm.makeModule({

	getProperty(obj, key) {
		if (key in obj)
			return obj[key];
		else
			throw new mm.Exception(key + ": property is undefined");
	},

	// arithmetics

	add(a, b) {
		return a + b;
	},
	sub(a, b) {
		return a - b;
	},
	mul(a, b) {
		return a * b;
	},
	div(a, b) {
		return a / b;
	},
	mod(a, b) {
		return a % b;
	},
	minus(a) {
		return -a;
	},
});

exports.coreModule = mm.registerModule("core", coreModule);
