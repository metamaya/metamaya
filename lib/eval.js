"use strict"

const mm = require('./metamaya');

// Returns the strict value of an expression in an environment.
// Throws if the expression cannot be strictly evaluated in the environment.
exports.eval = function eval_(expr, env) {
	return new mm.Evaluator(env).eval(expr);
}

// Strictly evaluates an object property.
// When called with a plain js object, it simply returns the property.
exports.evalProperty = function evalProperty(obj, key) {
	return mm.eval(obj[key],obj);
}


exports.Evaluator = function Evaluator(sc, parent) {
	this.sc = sc;
	this.parent = parent;
	if (parent) {
		this.debugger = parent.debugger;
	}
}
exports.Evaluator.prototype = {
	normalize(expr) {
		while (mm.isNonStrict(expr)) {
			let result = expr[mm.Normalize](this);
			if (result === expr)
				return expr;
			expr = result;
		}
		return expr;
	},
	// Strictly evaluates an expression in this context.
	eval(expr) {
		let nf = this.normalize(expr);
		if (mm.isNonStrict(nf))
			throw new mm.Exception("expression cannot be evaluated");
		else if (mm.isNonValue(nf))
			throw nf.error;
		else
			return nf;
	},
	// Call this to rewrite a reference in an object graph.
	// Note: calling this function is necessary for debugging features
	// to work properly.
	rewrite(obj, key, value) {
		if (this.debugger) {
			let oldValue = obj[key];
			obj[key] = value;
			this.debugger.rewrite(obj, key, value, oldValue);
		}
		else {
			obj[key] = value;
		}
	},
	// Looks up a standalone name or symbol key in the current static context.
	lookupStatic(key) {
		let sc = this.sc;
		while (typeof (sc) === 'object') {
			if (key in sc) {
				return sc[key];
			}
			sc = sc[mm.StaticContext];
		}
		throw new mm.Exception(key.toString() + ": undefined name");
	},
	// Looks up a context dependent name or symbol in this context.
	lookupDynamic(key) {
		let sc = this.sc;
		while (typeof (sc) === 'object') {
			if (key in sc) {
				return sc[key];
			}
			sc = sc[mm.StaticContext];
		}
		if (this.parent) {
			return this.parent.lookupDynamic(key);
		}
		throw new mm.Exception(key.toString() + ": undefined key");
	}
};
