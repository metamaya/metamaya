"use strict"

const mm = require("./implementation");

// A realm is a 'world' object. Its responsibilities include:
// - loading and caching metamaya program modules
// - providing options for the interpreter/optimizer
// - cooperation with a backend (compiler, analyzer or processor)
exports.Realm = function Realm(options) {

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
exports.Realm.prototype = {
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
	// Compiles a string and returns a wrapper to the compiled expression.
	compile(str) {
		let model = mm.parse(str);

		// TODO: the model shouldn't be pre-evaluated
		return new mm.Wrapper(mm.eval(model, global, this), this);
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
exports.Wrapper = function Wrapper(obj, realm) {
	this.obj = obj;
	this.realm = realm;
}
exports.Wrapper.prototype = {

	// Gets a property of the wrapped object.
	// Returns a wrapper to the property.
	get(key) {
		return this.eval(this.obj[key]);
	},
	// Calls the wrapped function.
	// Returns a Wrapper to the result of the function invocation.
	call(args) {
		return this.eval(new mm.prog.Invocation(null, this.obj, arguments));
	},
	// Returns the wrapped value.
	value() {
		return this.obj;
	},

	// Strictly evaluates an expression in the wrapped environment.
	// Returns a wrapper to the value of the expression.
	eval(expr) {
		return new mm.Wrapper(mm.eval(expr, this.obj, this.realm), this.realm);
	}
}
