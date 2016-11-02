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


function Module(body) {
	this.body = body;
}
Module.prototype[mm.Specialize] = function specialize(env, context) {
	return new mm.model.Module(this.body);
}
Module.prototype[mm.Reduce] = function (env, context) {
	if (!mm.rewrite(this, 'body', global, context))
		return this;

	// a module's value is its root object
	return this.body;
}


// statements


// Defines a key in the current environment.
function Definition(key, value) {
	this.key = key;
	this.value = value;
}
Definition.prototype[mm.Execute] = function execute(env, context) {
	if (this.key in env)
		throw new mm.Exception(this.key.toString() + ": duplicate key");
	else
		env[this.key] = mm.enclose(this.value, env);
}


// expressions


// Constructs a metamaya object.
function Constructor(proto, stms) {
	this.proto = proto;
	this.stms = stms;
}
Constructor.prototype[mm.Reduce] = function reduce(env, context) {
	// prototype must be strict
	if (!mm.rewrite(this, 'proto', env, context))
		return this;

	// create a fresh object in the current environment
	let obj = Object.create(this.proto);
	Object.defineProperty(obj, mm.Environment, { value: env });

	// execute statements in the new object as environment
	for (let stm of this.stms) {
		stm[mm.Execute](obj, context);
	}
	return obj;
}


// Standard prototype of metamaya objects.
let Prototype = Object.prototype;


// An invokable object with parameters.
function FunctionNode(params, body) {
	this.params = params;
	this.body = body;
	this.length = params.length;
}
FunctionNode.prototype.apply = function apply(target, args) {
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


function Parameter(name) {
	this.name = name;
}



// Reduces to the definition of a key (name or symbol)
// in the current environment.
function KeyReference(key, recursive) {
	this.key = key;
	this.recursive = recursive;
}
KeyReference.prototype[mm.Reduce] = function reduce(env, context) {
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


// Reduces to the value of a property (name or symbol).
// target - reducible object
// key - strict string, symbol or number
function PropertyReference(target, key) {
	this.target = target;
	this.key = key;
}
PropertyReference.prototype[mm.Specialize] = function specialize(env, context) {
	return new mm.model.PropertyReference(this.target, this.key);
}
PropertyReference.prototype[mm.Reduce] = function reduce(env, context) {
	if (!mm.rewrite(this, 'target', env, context))
		return this;

	return this.target[this.key];
}


// An expression that reduces to the current environment.
function This() {
}
This.prototype[mm.Reduce] = function reduce(env, context) {
	return env;
}


// A function invocation expression.
// 'target', 'func' and 'args' are considered referentially transparent.
// target - it will become 'this' when the function is called.
// func - a function or an expression that evaluates to a function
//        in the 'target' environment.
// args - arguments passed to the function
function Invocation(target, func, args) {
	this.target = target;
	this.func = func;
	this.args = args;
}
Invocation.prototype[mm.Specialize] = function (env, context) {
	return new mm.model.Invocation(this.target, this.func,
		this.args.slice());
}
Invocation.prototype[mm.Reduce] = function reduce(env, context) {
	// target is strict
	if (!mm.rewrite(this, 'target', env, context))
		return this;

	if (typeof this.target !== 'object')
		throw new mm.Exception("target must be an object");

	// func is strict
	// it is evaluated in the target context
	if (!mm.rewrite(this, 'func', this.target, context))
		return this;

	let args = this.args;
	let func = this.func;

	if (func == null || typeof func.apply !== "function")
		throw new mm.Exception("function required");

	let prepare = func[mm.PrepareInvoke];
	if (typeof prepare === "function") {
		if (!prepare(this.target, args, env, context))
			return this;
	} else {
		// all arguments are strict
		for (let i = 0; i < args.length; i++) {
			if (!mm.rewrite(args, i, env, context))
				return;
		}
	}
	return func.apply(this.target, args);
}


function Closure(expr, env) {
	this.expr = expr;
	this.originalExpr = expr;
	Object.defineProperty(this, 'env', { value: env });
}
Closure.prototype[mm.Reduce] = function reduce(env, context) {
	if (this.reducing) {
		throw new mm.Exception("cyclic dependency detected");
	}

	this.reducing = true;
	let result = mm.rewrite(this, 'expr', this.env, context);
	this.reducing = false;

	if(result)
		return this.expr;
	else
		return this;
}
Closure.prototype[mm.Unreduce] = function unreduce() {
	return this.originalExpr;
}


exports.model = {

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
	PropertyReference: PropertyReference,
	This: This,
	Invocation: Invocation,
	Closure: Closure,
}
