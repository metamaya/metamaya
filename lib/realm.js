"use strict"

const mm = require("./implementation");

// A realm is a 'world' object. Its responsibilities include:
// - loading and caching metamaya program modules
// - providing options for the interpreter/optimizer
// - cooperation with a backend (compiler, analyzer or processor)
exports.Realm = function Realm(options) {

	//// preprocessing options

	if (options)
		options = Object.create(defaultOptions, options);
	else
		options = defaultOptions;

	let opt = options.optimization;
	if (typeof opt === 'string') {
		opt = optimization[opt];
	}
	if (typeof opt !== 'object')
		throw new mm.Exception(opt.toString + ": invalid optimization options");

	this.options = options;
	this.optimization = opt;
	this.debugger = options.debugger;

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
	},
	full: {
		rewriteProperties: true,
	}
}

var defaultOptions = {
	optimization: optimization.full,
}
