// --------------------------------------------------------------------------
// Generic program model (PM).
// Metamaya source code should be translated to a program model before
// it can be interpreted or compiled to executable code.
// The program model is an annotated object tree
// resembling the structure of an abstract syntax tree (AST).
// However a PM is generic and doesn't reflect all details of
// the surface syntax from which it was generated.
// A PM is typically produced by compiler frontends and
// consumed by compiler backends or static code analyzers.
// It is an intermediate representation (IR)
// what is commonly found in compilers.
// --------------------------------------------------------------------------

"use strict"

let mm = require("./implementation");


// structure


function Module(rootObject) {
	this.rootObject = rootObject;
}
Module.prototype = {
	[mm.Reduce](rc) {
		// a module's value is its root object
		return rc.reduce(this.rootObject);
	}
}


// statements


// Defines a key in the current environment.
function Definition(key, expr) {
	this.key = key;
	this.expr = expr;
}
Definition.prototype = {
	[mm.Execute](rc) {
		if (this.key in rc.obj)
			throw new mm.Exception(this.key.toString() + ": duplicate key");
		else
			rc.obj[this.key] = this.expr;
	}
}


// expressions


// Constructs a metamaya object.
function Constructor(proto, stms, env) {
	this.proto = proto;
	this.stms = stms;
	Object.defineProperty(this, 'env', { value: env });
}
Constructor.prototype = {
	[mm.Reduce](rc) {
		if (this.env !== rc.obj) {
			// make a copy specialized to the runtime context
			// That allows for rewriting this node without losing
			// referential transparency.
			return new mm.prog.Constructor(this.proto, this.stms.slice(), rc.obj);
		}

		// prototype must be strict
		if (!rc.rewriteProperty(this, 'proto'))
			return this;

		// create a fresh object in the current environment
		let obj = Object.create(this.proto);
		Object.defineProperty(obj, mm.Environment, { value: rc.obj });

		// execute statements in the new object as environment
		rc = new mm.RuntimeContext(rc.realm, obj);
		for (let stm of this.stms) {
			stm[mm.Execute](rc);
		}
		return obj;
	}
}


// Standard prototype of metamaya objects.
let Prototype = Object.prototype;


// An invokable object with parameters.
function FunctionNode(params, body) {
	this.params = params;
	this.body = body;
	this.length = params.length;
}
//FunctionNode.prototype = {
//	apply(self, args) {
//		let sc = new mm.prog.Object(
//		sc[mm.StaticContext] = parentSc;
//		for (let i = 0; i < params.length; i++) {
//			sc[params[i]] = args[i];
//		}
//		return mm.enclose(body, sc);	}
//}


function Parameter(name) {
	this.name = name;
}



// Reduces to the definition of a key (name or symbol)
// in the current environment.
function KeyReference(key, recursive) {
	this.key = key;
	this.recursive = recursive;
}
KeyReference.prototype = {
	[mm.Reduce](rc) {
		let obj = rc.obj;
		do {
			if (this.key in obj) {
				return obj[this.key];
			}
			else if (this.recursive) {
				obj = obj[mm.Environment];
			}
			else {
				return this;
			}
		} while (obj);
		return this;
	}
}


// An expression that reduces to the current environment.
function This() {
}
This.prototype = {
	[mm.Reduce](rc) {
		return rc.obj;
	}
}


// A function invocation expression.
// 'target', 'func' and 'args' are considered referentially transparent.
// target - it will become 'this' when the function is called.
// func - a function or an expression that evaluates to a function
//        in the 'target' environment.
// args - arguments passed to the function
// env - optional environment for which the invocation is specialized
function Invocation(target, func, args, env) {
	this.target = target;
	this.func = func;
	this.args = args;
	Object.defineProperty(this, 'env', { value: env });
}
Invocation.prototype = {
	[mm.Reduce](rc) {
		if (this.env !== rc.obj) {
			// make a copy specialized to the runtime context
			// That allows for rewriting this node without losing
			// referential transparency.
			return new mm.prog.Invocation(this.target, this.func, this.args.slice(), rc.obj);
		}

		// target must be strict
		if (!rc.rewriteProperty(this, 'target'))
			return this;

		if (typeof this.target !== 'object')
			throw new mm.Exception("target must be an object");

		// func must be strict
		// it is evaluated in the target context
		let targetRc = new mm.RuntimeContext(rc.realm, this.target);
		if (!targetRc.rewriteProperty(this, 'func'))
			return this;

		if (!this.func || typeof this.func.apply !== 'function')
			throw new mm.Exception("function must be an invokable object");

		let args = this.args;

		//// check number of arguments
		//if (func.length && func.length > args.length)
		//	throw new mm.Exception("function needs " + func.length
		//		+ " arguments but got only " + args.length);

		// treat all parameters strict
		// todo: support non-strict parameters
		let allStrict = true;
		for (let i = 0; i < args.length; i++) {
			if (!rc.rewriteProperty(args, i))
				allStrict = false;
		}
		if (!allStrict)
			return this;

		return this.func.apply(this.target, args);
	}
}


function Closure(expr, env) {
	this.expr = expr;
	this.env = env;
}
Closure.prototype = {
	[mm.Reduce](rc) {
		// note: a closure is always specialized to the enclosed environment
		// so we don't have to make a copy
		if (mm.isReducible(this.expr)) {
			let savedEnv = rc.env;
			rc.env = this.env;
			this.expr = rc.reduce(this.expr);
			rc.env = savedEnv;
			if (mm.isReducible(this.expr)) {
				return this;
			}
		}
		return this.expr;
	}
}



exports.prog = {

	// structure

	Module: Module,

	// statements

	Definition: Definition,

	// expressions

	Constructor: Constructor,
	Function: FunctionNode,
	Prototype: Prototype,
	KeyReference: KeyReference,
	This: This,
	Invocation: Invocation,
	Closure: Closure,
}
