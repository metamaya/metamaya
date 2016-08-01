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
	// Loads a module and returns a runtime context.
	// Already loaded modules are served from cache.
	require(path) {
		let module = this.modules.get(path);
		if (module == null) {
			module = this.compile(fs.readFileSync(path, "utf-8"));
			this.modules.set(path, module);
		}
		return module;
	},
	// Compiles a string and returns a runtime context
	compile(str) {
		let model = mm.parse(str);

		// module root must be strict
		return new mm.RuntimeContext(this, global).eval(model);
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
