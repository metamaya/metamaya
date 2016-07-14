"use strict"

let mm = require("./metamaya");


// Places an expression in a specific static context.
exports.Closure = function Closure(expr, sc) {
	this.sc = sc;
	this.expr = expr;
}
exports.Closure.prototype = {
	[mm.Normalize](ec) {
		return new mm.EvalContext(this.sc, ec).normalize(this.expr);
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
		if (mm.isNonStrict(this.head)) {
			this.head = ec.normalize(this.head);
			if (mm.isNonValue(this.head))
				return this.head;
			else if (mm.isNonStrict(this.head))
				// can't apply head until it is strict
				return this;
		}

		if (typeof (this.head) === 'function') {
			// plain function
			if (this.head.length > this.args.length)
				throw new mm.Exception("function needs " + this.head.length
					+ " arguments but got only " + this.args.length);

			// all parameters are strict
			for (let i = 0; i < this.args.length; i++) {
				let arg = this.args[i];
				if (mm.isNonStrict(arg)) {
					this.args[i] = arg = ec.normalize(arg);
					if (mm.isNonStrict(arg))
						return this;
				}
			}
			return this.head.apply(ec, this.args);
		}
		else if (this.head && typeof(this.head[mm.Apply]) === 'function') {
			return this.head[mm.Apply].apply(ec, this.args);
		}
		else {
			throw new mm.Exception("head is not an applicable object");
		}
	},
}
