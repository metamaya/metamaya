"use strict"

let mm = require("./metamaya");


// Places an expression in a specific static context.
exports.Closure = function Closure(expr, sc) {
	this.sc = sc;
	this.expr = expr;
}
exports.Closure.prototype = {
	[mm.Normalize](ec) {
		return new mm.Evaluator(this.sc, ec).normalize(this.expr);
	},
}


// Lazily applies a function-like object to its arguments.
exports.Application = function Application(head, args) {
	this.head = head;
	this.args = args;
}
exports.Application.prototype = {
	[mm.Normalize](ec) {
		// head is evaluated first
		let head = this.head;
		if (mm.isNonStrict(head)) {
			head = ec.normalize(this.head);
			ec.rewrite(this, "head", head);
			if (mm.isNonValue(head))
				return head;
			else if (mm.isNonStrict(head))
				// can't apply head until it is strict
				return this;
		}

		if (head && typeof head.apply === 'function') {
			let args = this.args;

			// check number of arguments
			if (head.length && head.length > args.length)
				throw new mm.Exception("function needs " + head.length
					+ " arguments but got only " + args.length);

			// treat all parameters as strict
			// todo: support non-strict parameters
			for (let i = 0; i < args.length; i++) {
				let arg = args[i];
				if (mm.isNonStrict(arg)) {
					arg = ec.normalize(arg);
					ec.rewrite(args, i, arg);
					if (mm.isNonStrict(arg))
						return this;
				}
			}

			return head.apply(ec, args);
		}
		else {
			throw new mm.Exception("head is not an applicable object");
		}
	},
}
