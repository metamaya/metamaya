"use strict"

const mm = require("./implementation");

// These definitions don't require runtime context.
module.exports = {


	//// symbol keys


	Failure: '@metamaya-Failure',


	// obj.[mm.Environment] : IObject
	// Reference to the static environment. May be undefined.
	Environment: '@metamaya-Environment',


	// obj[mm.Reduce](rc)
	// Reduces the object in a runtime context.
	// Returns a new object, not necessarily IReducible.
	Reduce: '@metamaya-Reduce',


	// obj[mm.Execute](rc)
	// Executes the statement in 'rc'.
	// rc - a runtime context
	Execute: '@metamaya-Execute',


	//// object traits


	// Returns true if the value is immediately usable.
	// Plain javascript objects and primitive values are all strict.
	isStrict(obj) {
		return !obj || !obj[mm.Failure] && !obj[mm.Reduce];
	},
	// Returns true if the value is not strict but can be reduced
	// in order to make it strict.
	isReducible(obj) {
		return obj && obj[mm.Reduce];
	},
	// Returns true if the object is not strict and can't be reduced.
	// Such objects identify failed computations.
	isFailure(obj) {
		return obj && obj[mm.Failure];
	},
}
