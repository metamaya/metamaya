"use strict"

const fs = require("fs");
const path = require("path");
const mm = require('./metamaya');

var parser;
var semantics;

exports.compile = function(str) {
	// parse
	let mr = loadParser().match(str);
	if (mr.failed()) {
		throw new mm.Exception(mr.message);
	}

	// build graph
	let tree = semantics(mr).model();

	// bind the tree
	tree = mm.prog.reduce(tree, null);

	return tree;
}


// Loads the parser on demand.
// Initializes semantics of the parse tree.
function loadParser() {
	if (parser == null) {
		let ohm = require("ohm-js");
		let parserPath = path.join(__dirname, '../ohm/parser.ohm');
		parser = ohm.grammar(fs.readFileSync(parserPath)/*, { Lexer: lexer }*/);
		semantics = parser.semantics();
		semantics.addOperation('model', modelActions);
	}
	return parser;
}


const modelActions = {

	// structural

	File(stms) {
		let root = new mm.prog.ObjectNode(stms.model());
		return new mm.prog.Module(root);
	},
	Definition_namedValue(id, eq, expr, t) {
		return new mm.prog.Definition(id.model(), expr.model());
	},
	Definition_namedFunction(id, params, eq, expr, t) {
		let func = new mm.prog.Function(args.model(), expr.model());
		return new mm.prog.Definition(id.model(), func);
	},

	// operators

	Relation_infix(left, op, right) {
		return new mm.prog.InfixOperator(op.interval.contents, [left.model(), right.model()]);
	},
	Additive_infix(left, op, right) {
		return new mm.prog.InfixOperator(op.interval.contents, [left.model(), right.model()]);
	},
	Multiplicative_infix(left, op, right) {
		return new mm.prog.InfixOperator(op.interval.contents, [left.model(), right.model()]);
	},
	Factor_prefix(op, expr) {
		return new mm.prog.PrefixOperator(op.interval.contents, [expr.model()]);
	},

	// primary

	Primary_select(obj, op, id) {
		return new mm.prog.InfixOperator('.', [obj.model(), id.model()]);
	},
	Primary_index(obj, lbracket, key, rbracket) {
		return new mm.prog.PostfixOperator('[]', [obj.model(), key.model()]);
	},
	Primary_bind(head, args) {
		return new mm.prog.Invocation(head.model(), args.model());
	},
	Primary_parens(lp, expr, rp) {
		return expr.model();
	},
	Primary_object(lbrace, stms, rbrace) {
		return new mm.prog.ObjectNode(stms.model());
	},
	Primary_nameref(id) {
		return new mm.prog.NameReference(id.model());
	},

	// other

	ParamList(lp, params, rp) {
		return params.asIteration().model();
	},

	ArgumentList(lp, args, rp) {
		return args.asIteration().model();
	},

	// lexical rules

	nullLiteral(chars) {
		return null;
	},
	booleanLiteral(chars) {
		return this.interval.contents == "true" ? true : false;
	},
	numericLiteral(chars) {
		return new mm.prog.Number(parseFloat(this.interval.contents));
	},
	stringLiteral(quote1, chars, quote2) {
		return new mm.prog.String(chars.interval.contents);
	},
	regularExpressionLiteral(slash1, body, slash2, flags) {
		return new RegExp(body.interval.contents, flags.interval.contents);
	},
	identifier(id) {
		return id.interval.contents;
	},
};
