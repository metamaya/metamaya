"use strict"

const mm = require("./implementation");


module.exports = {


	//// symbol keys


	Failure: '@metamaya-Failure',


	// obj.[mm.Environment] : IObject
	// Reference to the static environment. May be undefined.
	Environment: '@metamaya-Environment',


	// obj[mm.Specialize](env, context)
	// Specializes the object to an environment.
	// Returns a new object.
	Specialize: '@metamaya-Specialize',


	// obj[mm.Reduce](env, context)
	// Reduces the object in an environment.
	// Returns a new object, not necessarily reducible.
	Reduce: '@metamaya-Reduce',


	// obj[mm.Unreduce]()
	// Returns a the unreduced value of a closure.
	Unreduce: '@metamaya-Reduce',


	// obj[mm.Execute](env, context)
	// Executes the statement in 'context'.
	// context - provides modules, options etc.
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
	// context - provides modules, options, debugger etc.
	eval(expr, env, context) {
		let value = this.reduce(expr, env, context);
		if (mm.isReducible(value)) {
			if (context.debugger)
				context.debugger.onBlocked(value);
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
	// context - provides modules, options, debugger etc.
	reduce(expr, env, context) {
		if (expr && expr[mm.Environment] !== env && expr[mm.Specialize]) {
			expr = expr[mm.Specialize](env, context);
			Object.defineProperty(expr, mm.Environment, { value: env });
		}

		let limit = context.reductionLimit;
		while (limit-- > 0 && mm.isReducible(expr)) {
			let result = expr[mm.Reduce](env, context);
			if (result === expr)
				return expr;

			if (context.debugger) {
				context.debugger.onReduce(expr, result);
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
	// context - provides modules, options, debugger etc.
	rewrite(obj, key, env, context) {
		let expr = obj[key];
		if (mm.isReducible(expr)) {
			if (context.debugger) {
				context.debugger.beforeRewrite(obj, key);
				obj[key] = expr = this.reduce(expr, env, context);
				context.debugger.afterRewrite(obj, key);
			}
			else {
				obj[key] = expr = this.reduce(expr, env, context);
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
