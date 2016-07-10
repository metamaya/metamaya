"use strict"

const fs = require("fs");
const mm = require('./metamaya');

var parser;
var semantics;
var parent;

exports.compile = function(str) {
	// parse
	let mr = loadParser().match(str);
	if (mr.failed()) {
		throw new mm.Exception(mr.message);
	}

	// build graph
	return semantics(mr).tree();
}

// Loads the parser on demand.
// Initializes semantics of the parse tree.
function loadParser() {
	if (parser == null) {
		let ohm = require("ohm-js");
		parser = ohm.grammar(fs.readFileSync('./ohm/parser.ohm')/*, { Lexer: lexer }*/);
		semantics = parser.semantics();
		semantics.addOperation('tree', treeActions);
	}
	return parser;
}

const treeActions = {

	// structural

	File(stms) {
		let result = {};
		parent = result;
		stms.tree();
		parent = undefined;
		return result;
	},
	Definition(id, op, expr, sc) {
		let value = expr.tree();
		// optimization: it's useless to enclose a primitive value
		parent[id.tree()] = (typeof(value) === 'object') ? mm.enclose(value,parent) : value;
	},

	// operators

	Additive_add(left, op, right) {
		return mm.bind(mm.coreModule.add, [left.tree(), right.tree()]);
	},
	Additive_sub(left, op, right) {
		return mm.bind(mm.coreModule.sub, [left.tree(), right.tree()]);
	},
	Multiplicative_mul(left, op, right) {
		return mm.bind(mm.coreModule.mul, [left.tree(), right.tree()]);
	},
	Multiplicative_div(left, op, right) {
		return mm.bind(mm.coreModule.div, [left.tree(), right.tree()]);
	},
	Multiplicative_mod(left, op, right) {
		return mm.bind(mm.coreModule.mod, [left.tree(), right.tree()]);
	},
	Factor_minus(op, expr) {
		return mm.bind(mm.coreModule.minus, [expr.tree()]);
	},

	// primary

	Primary_parens(lparen, expr, rparen) {
		return expr.tree();
	},
	Primary_object(lbrace, stms, rbrace) {
		let result = {};
		result[mm.StaticContext] = parent;
		parent = result;
		stms.tree();
		parent = result[mm.StaticContext];
		return result;
	},
	Primary_select(obj, op, id) {
		return mm.bind(mm.coreModule.getProperty, [obj.tree(), id.tree()]);
	},
	Primary_index(obj, lbracket, key, rbracket) {
		return mm.bind(mm.coreModule.getProperty, [obj.tree(), key.tree()]);
	},
	Primary_bind(head, lparen, args, rparen) {
		return mm.bind(head.tree(), args.tree());
	},
	Primary_baseref(id) {
		return mm.bind(mm.EvalContext.prototype.lookupStatic, [id.tree()]);
	},

	// lexical rules

	nullLiteral(chars) {
		return null;
	},
	booleanLiteral(chars) {
		return this.interval.contents == "true" ? true : false;
	},
	numericLiteral(chars) {
		return parseFloat(this.interval.contents);
	},
	stringLiteral(quote1, chars, quote2) {
		return chars.interval.contents;
	},
	regularExpressionLiteral(slash1, body, slash2, flags) {
		return new RegExp(body.interval.contents, flags.interval.contents);
	},
	identifier(id) {
		return id.interval.contents;
	},
};
