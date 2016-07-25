// --------------------------------------------------------------------------
// Generic program model (PM).
// Metamaya source code should be translated to a program model before
// it can be compiled to executable code.
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

let mm = require("./metamaya");

// structural

function Module(rootObject) {
	this.rootObject = rootObject;
}

// statement

function Definition(name, value) {
	this.name = name;
	this.value = value;
}

// expression

function ObjectNode(stmList) {
	this.stmList = stmList;
}
ObjectNode.prototype = {
	reduce(parent) {
		this.parentNamespace = parent.namespace;
		this.namespace = this;

		// execute statement list
		let stms = this.stmList;
		for (let i = 0; i < stms.length; i++) {
			stms[i] = reduce(stms[i], this);
		}
		return this;
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
	reduce(parent) {
		this.namespace = parent.namespace;
		return this;
	}
}

function PrefixOperator(op, args) {
	this.op = op;
	this.args = args;
}
PrefixOperator.prototype = {
	reduce(parent) {
		this.namespace = parent.namespace;

		let args = this.args;
		for (let i = 0; i < args.length; i++) {
			args[i] = reduce(args[i], this);
		}
		return this;
	}
}

function PostfixOperator(op, args) {
	this.op = op;
	this.args = args;
}
PostfixOperator.prototype = {
	reduce(parent) {
		this.namespace = parent.namespace;

		let args = this.args;
		for (let i = 0; i < args.length; i++) {
			args[i] = reduce(args[i], this);
		}
		return this;
	}
}

function InfixOperator(op, args) {
	this.op = op;
	this.args = args;
}
InfixOperator.prototype = {
	reduce(parent) {
		this.namespace = parent.namespace;

		let args = this.args;
		for (let i = 0; i < args.length; i++) {
			args[i] = reduce(args[i], this);
		}
		return this;
	}
}

function Invocation(func, args) {
	this.func = func;
	this.args = args;
}
Invocation.prototype = {
	reduce(parent) {
		this.namespace = parent.namespace;

		let args = this.args;
		for (let i = 0; i < args.length; i++) {
			args[i] = reduce(args[i],this);
		}
		return this;
	}
}

// literal

function Number(value) {
	this.value = value;
}

function String(value) {
	this.value = value;
}



// Reduces a node until fix point is reached.
function reduce(node, parent) {
	while (node.reduce) {
		let result = node.reduce(parent);
		if (result == node)
			break;
		node = result;
	}
	return node;
}


exports.prog = {

	reduce: reduce,

	Module: Module,
	ObjectNode: ObjectNode,
	Definition: Definition,
	NameReference: NameReference,
	PrefixOperator: PrefixOperator,
	PostfixOperator: PostfixOperator,
	InfixOperator: InfixOperator,
	Invocation: Invocation,

	Number: Number
}
