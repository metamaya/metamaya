"use strict"

const fs = require("fs");
const mm = require("./implementation");

// A context is a 'world' object. Its responsibilities include:
// - loading and caching metamaya program modules
// - providing options for the interpreter/optimizer
// - cooperation with a backend (compiler, analyzer or processor)
exports.Context = function Context(options) {

	//// set options

	function setBasicOptions(self, options) {
		self.debugger = options.debugger;
	}
	setBasicOptions(this, defaultOptions);
	if (options)
		setBasicOptions(this, options);

	//// set optimization options

	let opt = options ? options.optimization : undefined;
	if (opt === undefined) {
		opt = optimization.full;
	}
	else if (typeof opt === 'string' && optimization.hasOwnProperty(opt)) {
		opt = optimization[opt];
	}

	if (typeof opt !== 'object')
		throw new mm.Exception(opt.toString + ": invalid optimization options");

	this.reductionLimit = opt.reductionLimit;
	this.rewriteProperties = opt.rewriteProperties;

	this.modules = new Map();
}
exports.Context.prototype = {
	// Loads a module and returns a wrapper to the module.
	// Already loaded modules are served from cache.
	require(path) {
		let module = this.modules.get(path);
		if (module == null) {
			module = this.compile(fs.readFileSync(path, "utf-8"));
			this.modules.set(path, module);
		}
		return module;
	},
	// Compiles a string and returns a wrapper to the compiled module.
	compile(str) {
		let model = mm.parse(str);
		return new mm.Wrapper(model, this);
	},
	// Adds a prepared module to the interpreter.
	// The module can be required using require().
	// Returns the module.
	// Throws if 'name' is not a unique module name.
	addModule(name, module) {
		if (this.modules.has(name))
			throw new Exception(name + ": module is already registered");
		this.modules.set(name, module);
		return module;
	},
	// Prepares a native module before adding it to the module cache.
	makeModule(defs) {
		// todo: verify definitions
		return defs;
	},
}


// default options


var optimization = {
	none: {
		reductionLimit: 0,
	},
	full: {
		reductionLimit: Infinity,
		rewriteProperties: true,
	}
}

var defaultOptions = {
	optimization: optimization.full,
}


// User-friendly wrapper for metamaya objects.
exports.Wrapper = function Wrapper(obj, context) {
	this.obj = obj;
	this.context = context;
}
exports.Wrapper.prototype = {

	// Returns the wrapped strict value.
	value() {
		this.obj = mm.eval(this.obj, null, this.context);
		return this.obj;
	},
	// Gets a property of the wrapped object.
	// Returns a wrapper to the property.
	get(key) {
		return new mm.Wrapper(this.value()[key], this.context);
	},
	// Calls the wrapped function.
	// Returns a Wrapper to the result of the function invocation.
	call(target, ...args) {
		return new mm.Wrapper(new mm.model.Invocation(target, this.value(), args), this.context);
	},
	// Strictly evaluates an expression in the wrapped environment.
	// Returns a wrapper to the value of the expression.
	eval(expr) {
		return new mm.Wrapper(mm.eval(expr, this.value(), this.context), this.context);
	}
}
