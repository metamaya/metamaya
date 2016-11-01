'use strict'

/**
 * This module should be required when private definitions are needed.
 */

/**
 * List of modules to be required by all implementation modules.
 * Note: if module B is load-time dependent on module A,
 * B should be preceded by A in the list.
 */
let modules = [
	"./context",
	"./runtime",
	"./program",
	"./parser",
	"./debugger",
	"./utils",

	// metamaya system modules

	"../modules/core",
];

// reexport everything from implementation modules
for (let modName of modules) {
	let module = require(modName);
	for (let expName of Object.getOwnPropertyNames(module)) {
		exports[expName] = module[expName];
	}
}
