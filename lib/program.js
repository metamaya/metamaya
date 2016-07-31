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


function Definition(key, expr) {
	this.key = key;
	this.expr = expr;
}
Definition.prototype = {
	[mm.Execute](rc) {
		// note: if we allow for setting a property multiple times, we can publish
		// the current object only after all statements are executed.
		rc.obj[mm.Define](this.key, this.expr);
	}
}


// expressions


// Constructs a metamaya object.
function Constructor(stmList) {
	this.stmList = stmList;
}
Constructor.prototype = {
	[mm.Reduce](rc) {
		let obj = new mm.prog.Object(rc.obj);

		// execute statements in a new context
		rc = new mm.RuntimeContext(rc.realm, obj);

		// execute statement list
		for (let stm of this.stmList) {
			stm[mm.Execute](rc);
		}
		return obj;
	}
}


function ObjectNode(parentObject) {
	Object.defineProperty(this, mm.ParentObject, { value: parentObject });
}
// TODO: in std metamaya the Javascript global object can't be accessed
ObjectNode.prototype = {
	// Looks up a key in the static scope of the object.
	// Throws exception if the key is not defined.
	[mm.Lookup](key) {
		if (key in this)
			return this[key];
		else if (this[mm.parentObject])
			return this[mm.parentObject][mm.Lookup](name);
		else
			throw new mm.Exception(key.toString() + ": undefined key");
	},
	// Returns a property of the object.
	// Throws exception if the key is not defined.
	[mm.Get](key) {
		if (key in this)
			return this[key];
		else
			throw new mm.Exception(key.toString() + ": undefined key");
	},
	// Adds a definition to the object.
	// Throws exception if the key is already defined.
	[mm.Define](key, value) {
		if (key in this)
			throw new mm.Exception(key.toString() + ": duplicate key");
		else
			this[key] = value;
	}
}


function Function(paramList, expr) {
	this.paramList = paramList;
	this.expr = expr;
}


function NameReference(name) {
	this.name = name;
}
NameReference.prototype = {
	[mm.Reduce](rc) {
		return rc.lookup(this.name);
	}
}


function Invocation(head, args) {
	this.head = head;
	this.args = args;
}
Invocation.prototype = {
	withEnvironment(env) {
		this.env = env;
		return this;
	},
	[mm.Reduce](rc) {
		if (this.env !== rc.env) {
			// make a specialized copy
			// This allows for rewriting this node without losing
			// referential transparency.
			return new mm.prog.Invocation(this.head, this.args.slice()).withEnvironment(rc.env);
		}

		// head is evaluated first
		let head = this.head;
		if (mm.isReducible(head)) {
			head = rc.reduce(this.head);
			rc.rewrite(this, "head", head);
			if (rc.isFailure(head))
				return head;
			else if (mm.isReducible(head))
				// can't apply head until it is strict
				return this;
		}

		if (head && typeof head.apply === 'function') {
			let args = this.args;

			// check number of arguments
			if (head.length && head.length > args.length)
				throw new mm.Exception("function needs " + head.length
					+ " arguments but got only " + args.length);

			// treat all parameters strict
			// todo: support non-strict parameters
			for (let i = 0; i < args.length; i++) {
				let arg = args[i];
				if (mm.isReducible(arg)) {
					arg = rc.reduce(arg);
					rc.rewrite(args, i, arg);
					if (mm.isReducible(arg))
						return this;
				}
			}

			return head.apply(rc, args);
		}
		else {
			throw new mm.Exception("head is not an applicable object");
		}
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
		if (rc.isReducible(this.expr)) {
			let savedEnv = rc.env;
			rc.env = this.env;
			this.expr = rc.reduce(this.expr);
			rc.env = savedEnv;
			if (rc.isReducible(this.expr)) {
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
	Function: Function,
	Object: ObjectNode,
	NameReference: NameReference,
	Invocation: Invocation,
	Closure: Closure,
}
