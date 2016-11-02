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

	let recipe = fs.readFileSync(recipePath, "utf-8");
	parser = ohm.makeRecipe(eval(recipe));

	semantics = parser.semantics();
	semantics.addOperation('model', modelActions);

	// init operator table (it can't be done at load time)
	operators = {
		prefix: {
			'-': mm.coreModule.minus
		},
		postfix: {
		},
		infix: {
			'.': function getProperty(obj, key) { return obj[key]; },

			'===': mm.coreModule.eqs,
			'!==': mm.coreModule.neqs,
			'==': mm.coreModule.eq,
			'!=': mm.coreModule.neq,
			'<': mm.coreModule.lt,
			'<=': mm.coreModule.le,
			'>': mm.coreModule.gt,
			'>=': mm.coreModule.ge,

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

	return new mm.model.Invocation(null, func, args);
}

const modelActions = {

	// structural

	File(stms) {
		let root = new mm.model.Constructor(mm.model.Prototype, stms.model());
		return new mm.model.Module(root);
	},
	Definition_namedValue(id, eq, expr, t) {
		return new mm.model.Definition(id.model(), expr.model());
	},
	Definition_namedObject(id, lbrace, stms, rbrace, t) {
		return new mm.model.Definition(id.model(), new mm.model.Constructor(mm.model.Prototype, stms.model()));
	},
	//Definition_namedObjectExtend(id, colon, expr, lbrace, stms, rbrace, t) {
	//	return new mm.model.Definition(id.model(), new mm.model.Constructor(expr.model(), stms.model()));
	//},
	Definition_namedFunction(id, params, eq, expr, t) {
		let func = new mm.model.Function(params.model(), expr.model());
		return new mm.model.Definition(id.model(), func);
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
	Factor_if(if_, rparen, cond, lparen, cons, else_, alt) {
		return new mm.model.Invocation(null, mm.coreModule.if, [cond.model(), cons.model(), alt.model()]);
	},

	// primary

	Primary_getProperty(obj, op, id) {
		return new mm.model.PropertyReference(obj.model(), id.model());
	},
	Primary_index(obj, lbracket, key, rbracket) {
		return new mm.model.PropertyReference(obj.model(), key.model());
	},
	Primary_invoke(func, args) {
		return new mm.model.Invocation(new mm.model.This(), func.model(), args.model());
	},
	Primary_invokeProperty(obj, pt, id, args) {
		return new mm.model.Invocation(obj.model(), new mm.model.KeyReference(id.model(), false), args.model());
	},
	Primary_parens(lp, expr, rp) {
		return expr.model();
	},
	Primary_object(lbrace, stms, rbrace) {
		return new mm.model.Constructor(mm.model.Prototype, stms.model());
	},
	Primary_objectExtend(expr, lbrace, stms, rbrace) {
		return new mm.model.Constructor(expr.model(), stms.model());
	},
	Primary_nameReference(id) {
		return new mm.model.KeyReference(id.model(), true);
	},

	// other

	ParamList(lp, params, rp) {
		return params.asIteration().model();
	},

	Parameter(id) {
		return new mm.model.Parameter(id.model());
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
