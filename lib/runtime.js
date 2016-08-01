"use strict"

let mm = require("./implementation");


// Interprets a metamaya expression.
exports.RuntimeContext = function RuntimeContext(realm, obj) {
	this.realm = realm;
	this.obj = obj;
}
exports.RuntimeContext.prototype = {

	//// user API

	// Gets a property of the object wrapped by the runtime context.
	// Returns a new runtime context wrapping the property.
	get(key) {
		return this.eval(this.obj[mm.Get](key));
	},
	// TODO: path(...key)
	// Calls the function wrapped by the runtime context.
	// Returns a new runtime context wrapping the result of the funcion invocation.
	call(args) {
		return this.eval(new mm.prog.Invocation(this.obj, arguments));
	},
	// Returns the value wrapped by the runtime context.
	value() {
		return this.obj;
	},


	//// model API

	// Gets a property of the object wrapped by the runtime context.
	// Returns a new runtime context wrapping the property.
	lookup(key) {
		return this.obj[mm.Lookup](key);
	},
	
	// Reduces an expression in the runtime context.
	// Returns the reduced expression.
	// Takes repeated reduce steps until 'expr' is no more reducible
	// or is blocked by missing information.
	reduce(expr) {
		while (mm.isReducible(expr)) {
			let result = expr[mm.Reduce](this);
			if (result === expr)
				return expr;
			expr = result;
		}
		return expr;
	},

	// Strictly evaluates an expression in the runtime context.
	// Returns a new runtime context that wraps the value of the expression.
	eval(expr) {
		let value = this.reduce(expr);
		if (mm.isReducible(value))
			throw new mm.Exception("expression is blocked");
		else if (mm.isFailure(value))
			throw value.error;
		else
			return new mm.RuntimeContext(this.realm, value);
	},

	// Call this function to rewrite a reference in the program graph.
	// Note: calling this function is necessary for the debugger
	// to work properly.
	rewrite(obj, key, value) {
		if (this.realm.debugger) {
			this.realm.debugger.beforeRewrite(obj, key);
			obj[key] = value;
			this.realm.debugger.afterRewrite(obj, key);
		}
		else {
			obj[key] = value;
		}
	},
}
