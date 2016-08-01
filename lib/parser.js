"use strict"

const fs = require("fs");
const path = require("path");
const mm = require('./implementation');

var parser;
var semantics;
var operators;

// Parses metamaya source code and builds program model.
exports.parse = function parse(str) {
	if (!parser)
		initParser();

	let mr = parser.match(str);
	if (mr.failed()) {
		throw new mm.Exception(mr.message);
	}

	// build program model
	return semantics(mr).model();
}

function initParser() {

	//// load parser

	let ohm = require("ohm-js");
	let recipePath = path.join(__dirname, "../ohm/recipe.js");

	//let parserPath = path.join(__dirname, '../ohm/parser.ohm');
	//parser = ohm.grammar(fs.readFileSync(parserPath)/*, { Lexer: lexer }*/);

	//let recipe = parser.toRecipe();
	//fs.writeFileSync(recipePath, recipe, { encoding: "utf-8" });

	let recipe = fs.readFileSync(recipePath, "utf-8");
	parser = ohm.makeRecipe(eval(recipe));

	semantics = parser.semantics();
	semantics.addOperation('model', modelActions);

	// init operator table (it can't be done at load time)
	operators = {
		prefix: {
			'-': mm.coreModule.minus,
		},
		postfix: {
			'[]': function getProperty(obj, key) { return obj[mm.Get](key); },
		},
		infix: {
			'.': function getProperty(obj, key) { return obj[mm.Get](key); },

			'+': mm.coreModule.add,
			'-': mm.coreModule.sub,
			'*': mm.coreModule.mul,
			'/': mm.coreModule.div,
			'%': mm.coreModule.mod,
		},
	}
}

function translateOperator(optype, op, args) {
	let func = operators[optype][op];
	if (!func)
		throw new mm.Exception(op + ": undefined " + optype + " operator");

	return new mm.prog.Invocation(func, args);
}

const modelActions = {

	// structural

	File(stms) {
		let root = new mm.prog.Constructor(stms.model());
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
		return translateOperator('infix', op.interval.contents, [left.model(), right.model()]);
	},
	Additive_infix(left, op, right) {
		return translateOperator('infix', op.interval.contents, [left.model(), right.model()]);
	},
	Multiplicative_infix(left, op, right) {
		return translateOperator('infix', op.interval.contents, [left.model(), right.model()]);
	},
	Factor_prefix(op, expr) {
		return translateOperator('prefix', op.interval.contents, [expr.model()]);
	},

	// primary

	Primary_select(obj, op, id) {
		return translateOperator('infix', '.', [obj.model(), id.model()]);
	},
	Primary_index(obj, lbracket, key, rbracket) {
		return translateOperator('postfix', '[]', [obj.model(), key.model()]);
	},
	Primary_bind(func, args) {
		return new mm.prog.Invocation(func.model(), args.model());
	},
	Primary_bindInstanceMethod(obj, pt, id, args) {
		return new mm.prog.MethodInvocation(obj.model(), id.model(), args.model());
	},
	Primary_parens(lp, expr, rp) {
		return expr.model();
	},
	Primary_object(lbrace, stms, rbrace) {
		return new mm.prog.Constructor(stms.model());
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



