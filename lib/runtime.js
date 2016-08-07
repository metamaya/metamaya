"use strict"

const mm = require("./implementation");


module.exports = {


	//// symbol keys


	Failure: '@metamaya-Failure',


	// obj.[mm.Environment] : IObject
	// Reference to the static environment. May be undefined.
	Environment: '@metamaya-Environment',


	// obj[mm.Reduce](env, realm)
	// Reduces the object in an environment.
	// Returns a new object, not necessarily IReducible.
	Reduce: '@metamaya-Reduce',


	// obj[mm.Execute](env, realm)
	// Executes the statement in 'realm'.
	// realm - provides modules, options etc.
	Execute: '@metamaya-Execute',


	//// object traits


	// Returns true if the object is an immediately usable value.
	// Plain javascript objects and primitive values are all strict.
	isStrict(obj) {
		return !obj || !obj[mm.Failure] && !obj[mm.Reduce];
	},
	// Returns true if the object is not strict but can be reduced
	// in order to make it strict.
	isReducible(obj) {
		return obj && obj[mm.Reduce];
	},
	// Returns true if the object is not strict and can't be reduced.
	// Such objects identify failed computations.
	isFailure(obj) {
		return obj && obj[mm.Failure];
	},


	//// evaluation


	// Strictly evaluates an expression in an environment.
	// Returns the value of the expression.
	// expr - expression to evaluate
	// env - name lookup environment
	// realm - provides modules, options, debugger etc.
	eval(expr, env, realm) {
		let value = this.reduce(expr, env, realm);
		if (mm.isReducible(value)) {
			if (realm.debugger)
				realm.debugger.onBlocked(value);
			throw new mm.Exception("expression is blocked");
		}
		else if (mm.isFailure(value))
			throw value.error;
		else
			return value;
	},

	// Reduces an expression in an environment.
	// Returns the reduced expression.
	// Takes repeated reduce steps until 'expr' is no more reducible
	// or is blocked by missing information.
	// expr - expression to reduce
	// env - name lookup environment
	// realm - provides modules, options, debugger etc.
	reduce(expr, env, realm) {
		let limit = realm.reductionLimit;
		while (limit-- > 0 && mm.isReducible(expr)) {
			let result = expr[mm.Reduce](env, realm);
			if (result === expr)
				return expr;

			if (realm.debugger) {
				realm.debugger.onReduce(expr, result);
			}
			expr = result;
		}
		return expr;
	},


	// Rewrites a property of a program node.
	// The property obj[key] is reduced in the given environment
	// and the property is set to the reduced value.
	// Returns true if the new value is strict.
	// obj - the target object
	// key - property key (string or symbol)
	// env - name lookup environment
	// realm - provides modules, options, debugger etc.
	rewriteProperty(obj, key, env, realm) {
		let expr = obj[key];
		if (mm.isReducible(expr)) {
			if (realm.debugger) {
				realm.debugger.beforeRewrite(obj, key);
				obj[key] = expr = this.reduce(expr, env, realm);
				realm.debugger.afterRewrite(obj, key);
			}
			else {
				obj[key] = expr = this.reduce(expr, env, realm);
			}
		}
		return mm.isStrict(expr);
	},


	// Ensures that an expression will be evaluated in a specific environment.
	enclose(expr, env) {
		if (!mm.isReducible(expr))
			return expr;
		else if (expr instanceof mm.prog.Closure)
			return expr;
		else
			return new mm.prog.Closure(expr, env);
	}
}
