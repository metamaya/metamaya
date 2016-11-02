"use strict"

// todo: require only public interface
const mm = require("../lib/implementation");

exports.coreModule = {

	// relation

	lt(a, b) {
		return a < b;
	},
	le(a, b) {
		return a <= b;
	},
	gt(a, b) {
		return a > b;
	},
	ge(a, b) {
		return a >= b;
	},
	eq(a, b) {
		return a == b;
	},
	neq(a, b) {
		return a != b;
	},
	eqs(a, b) {
		return a === b;
	},
	neqs(a, b) {
		return a !== b;
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

	
	// control

	if: mm.makeFunction({
		prepare(target, args, env, context) {
			return mm.rewrite(args, 0, env, context);
		},
		invoke(cond, cons, alt) {
			return cond ? cons : alt;
		}
	})
};
