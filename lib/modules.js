"use strict"

const fs = require("fs");
const mm = require("./metamaya");

// Maps module names to loaded modules.
let modules = new Map();

// Loads a metamaya module from file.
// Already loaded modules are served from a cache.
exports.require = function require(path) {
	let module = modules.get(path);
	if (module == null) {
		module = mm.compile(fs.readFileSync(path, "utf-8"));
		modules.set(path, module);
	}
	return module;
}

// Adds a prepared module to metamaya.
// The module can be required using metamaya.require().
// Returns the module.
// Throws if 'name' is not a unique module name.
exports.registerModule = function addModule(name, module) {
	if (modules.has(name))
		throw new Exception(name + ": module is already registered");
	modules.set(name, module);
	return module;
}

exports.makeModule = function makeModule(defs) {
	// todo: verify definitions
	return defs;
}
