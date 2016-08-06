"use strict"

let mm = require("./implementation");


// Interprets a metamaya expression.
exports.RuntimeContext = function RuntimeContext(realm, obj) {
	Object.defineProperty(this, 'realm', { value: realm });
	this.obj = obj;
}
exports.RuntimeContext.prototype = {

	//// user API

	// Gets a property of the object wrapped by the runtime context.
	// Returns a new runtime context wrapping the property.
	get(key) {
		return this.eval(this.obj[key]);
	},
	// TODO: path(...key)
	// Calls the function wrapped by the runtime context.
	// Returns a new runtime context wrapping the result of the funcion invocation.
	call(args) {
		return this.eval(new mm.prog.Invocation(null, this.obj, arguments));
	},
	// Returns the value wrapped by the runtime context.
	value() {
		return this.obj;
	},


	//// model API

	// Reduces an expression in the runtime context.
	// Returns the reduced expression.
	// Takes repeated reduce steps until 'expr' is no more reducible
	// or is blocked by missing information.
	reduce(expr) {
		let limit = this.realm.reductionLimit;
		while (limit-- > 0 && mm.isReducible(expr)) {
			let result = expr[mm.Reduce](this);
			if (result === expr)
				return expr;

			if (this.realm.debugger) {
				this.realm.debugger.onReduce(expr, result);
			}
			expr = result;
		}
		return expr;
	},

	// Strictly evaluates an expression in the runtime context.
	// Returns a new runtime context that wraps the value of the expression.
	eval(expr) {
		let value = this.reduce(expr);
		if (mm.isReducible(value)) {
			if (this.realm.debugger)
				this.realm.debugger.onBlocked(value);
			throw new mm.Exception("expression is blocked");
		}
		else if (mm.isFailure(value))
			throw value.error;
		else
			return new mm.RuntimeContext(this.realm, value);
	},

	// Call this function to rewrite a property of a program node.
	// Value of the property is reduced in the current context
	// and the result is written back into the property.
	// Returns true if the new property value is strict.
	rewriteProperty(obj, key) {
		let expr = obj[key];
		if (mm.isReducible(expr)) {
			if (this.realm.debugger) {
				this.realm.debugger.beforeRewrite(obj, key);
				obj[key] = expr = this.reduce(expr);
				this.realm.debugger.afterRewrite(obj, key);
			}
			else {
				obj[key] = expr = this.reduce(expr);
			}
		}
		return mm.isStrict(expr);
	}
}
