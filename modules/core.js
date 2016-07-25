"use strict"

const mm = require("../lib/metamaya");

let coreModule = mm.makeModule({

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
