"use strict"

const fs = require("fs");
const path = require("path");
const mm = require('./metamaya');

var parser;
var semantics;
var currentSc = global;

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
		let parserPath = path.join(__dirname, '../ohm/parser.ohm');
		parser = ohm.grammar(fs.readFileSync(parserPath)/*, { Lexer: lexer }*/);
		semantics = parser.semantics();
		semantics.addOperation('tree', treeActions);
	}
	return parser;
}

const treeActions = {

	// structural

	File(stms) {
		let result = {};
		// the property won't show up in enumerations and won't affect tape's deepEqual
		Object.defineProperty(result, mm.StaticContext, { value: currentSc });
		currentSc = result;
		stms.tree();
		currentSc = result[mm.StaticContext];
		return result;
	},
	Definition_namedValue(id, op, expr, sc) {
		let value = expr.tree();
		// optimization: it's useless to enclose a primitive value
		currentSc[id.tree()] = (typeof (value) === 'object') ? mm.enclose(value, currentSc) : value;
	},
	Definition_namedFunction(id, lp, list, rp, eq, expr, t) {
		let params = list.asIteration().tree();
		let body = expr.tree();
		let parentSc = currentSc;
		currentSc[id.tree()] = {
			length: params.length,
			apply(ec, args) {
				// todo: ec is not considered (should it be?)

				// create a static context where each argument is bound
				// to the corresponding param name
				let sc = {}
				sc[mm.StaticContext] = parentSc;
				for (let i = 0; i < params.length; i++) {
					sc[params[i]] = args[i];
				}
				return mm.enclose(body, sc);
			}
		};
	},
	//Definition_bracketValue(lbracket, expr1, rbracket, op, expr2, sc) {
	//	let value = expr2.tree();
	//	// optimization: it's useless to enclose a primitive value
	//	currentSc[id.tree()] = (typeof (value) === 'object') ? mm.enclose(value, currentSc) : value;
	//},

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

	Primary_parens(lp, expr, rp) {
		return expr.tree();
	},
	Primary_object(lbrace, stms, rbrace) {
		let result = {};
		// the property won't show up in enumerations and won't affect tape's deepEqual
		Object.defineProperty(result, mm.StaticContext, { value: currentSc });
		currentSc = result;
		stms.tree();
		currentSc = result[mm.StaticContext];
		return result;
	},
	Primary_select(obj, op, id) {
		return mm.bind(mm.coreModule.getProperty, [obj.tree(), id.tree()]);
	},
	Primary_index(obj, lbracket, key, rbracket) {
		return mm.bind(mm.coreModule.getProperty, [obj.tree(), key.tree()]);
	},
	Primary_bind(head, lp, args, rp) {
		return mm.bind(head.tree(), args.asIteration().tree());
	},
	Primary_baseref(id) {
		return mm.bind(mm.Evaluator.prototype.lookupStatic, [id.tree()]);
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
