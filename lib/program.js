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


function Module(rootObject, env = undefined) {
	this.rootObject = rootObject;
	Object.defineProperty(this, 'env', { value: env });
}
Module.prototype = {
	[mm.Reduce](env, realm) {
		if (this.env !== env) {
			// specialize object
			return new mm.prog.Module(this.rootObject, env);
		}

		if (!mm.rewriteProperty(this, 'rootObject', global, realm))
			return this;

		// a module's value is its root object
		return this.rootObject;
	}
}


// statements


// Defines a key in the current environment.
function Definition(key, expr) {
	this.key = key;
	this.expr = expr;
}
Definition.prototype = {
	[mm.Execute](env, realm) {
		if (this.key in env)
			throw new mm.Exception(this.key.toString() + ": duplicate key");
		else
			env[this.key] = mm.enclose(this.expr, env);
	}
}


// expressions


// Constructs a metamaya object.
function Constructor(proto, stms, env = undefined) {
	this.proto = proto;
	this.stms = stms;
	Object.defineProperty(this, 'env', { value: env });
}
Constructor.prototype = {
	[mm.Reduce](env, realm) {
		if (this.env !== env) {
			// make a copy specialized to the current environment
			// That allows for rewriting this node without losing
			// referential transparency.
			return new mm.prog.Constructor(this.proto, this.stms.slice(), env);
		}

		// prototype must be strict
		if (!mm.rewriteProperty(this, 'proto', env, realm))
			return this;

		// create a fresh object in the current environment
		let obj = Object.create(this.proto);
		Object.defineProperty(obj, mm.Environment, { value: env });

		// execute statements in the new object as environment
		for (let stm of this.stms) {
			stm[mm.Execute](obj, realm);
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
FunctionNode.prototype = {
	apply(target, args) {
		// create arguments object in the target environment
		// note: this doesn't support generic functions
		// (a function whose target is unrelated to the defining environment)
		let argObj = Object.create(null);
		Object.defineProperty(argObj, mm.Environment, { value: target });

		// add all arguments to the object
		for (let i = 0; i < args.length; i++) {
			let param = this.params[i];
			argObj[param.name] = args[i];
		}

		return mm.enclose(this.body, argObj);
	}
}


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
	[mm.Reduce](env, realm) {
		let obj = env;
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
	[mm.Reduce](env, realm) {
		return env;
	}
}


// A function invocation expression.
// 'target', 'func' and 'args' are considered referentially transparent.
// target - it will become 'this' when the function is called.
// func - a function or an expression that evaluates to a function
//        in the 'target' environment.
// args - arguments passed to the function
// env - optional environment for which the invocation is specialized
function Invocation(target, func, args, env = undefined) {
	this.target = target;
	this.func = func;
	this.args = args;
	Object.defineProperty(this, 'env', { value: env });
}
Invocation.prototype = {
	[mm.Reduce](env, realm) {
		if (this.env !== env) {
			// make a copy specialized to the current environment
			// That allows for rewriting this node without losing
			// referential transparency.
			return new mm.prog.Invocation(this.target, this.func, this.args.slice(), env);
		}

		// target must be strict
		if (!mm.rewriteProperty(this, 'target', env, realm))
			return this;

		if (typeof this.target !== 'object')
			throw new mm.Exception("target must be an object");

		// func must be strict
		// it is evaluated in the target context
		if (!mm.rewriteProperty(this, 'func', this.target, realm))
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
			if (!mm.rewriteProperty(args, i, env, realm))
				allStrict = false;
		}
		if (!allStrict)
			return this;

		return this.func.apply(this.target, args);
	}
}


function Closure(expr, env) {
	this.expr = expr;
	Object.defineProperty(this, 'env', { value: env });
}
Closure.prototype = {
	[mm.Reduce](env, realm) {
		// note: a closure is always specialized to the enclosed environment
		// so we don't have to specialize it

		if (this.reducing) {
			throw new mm.Exception("cyclic dependency detected");
		}

		this.reducing = true;
		let result = mm.rewriteProperty(this, 'expr', this.env, realm);
		this.reducing = false;

		if(result)
			return this.expr;
		else
			return this;
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
	Parameter: Parameter,
	Prototype: Prototype,
	KeyReference: KeyReference,
	This: This,
	Invocation: Invocation,
	Closure: Closure,
}
