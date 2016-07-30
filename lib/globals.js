"use strict"

const mm = require("./metamaya");

// These definitions don't require runtime context.
module.exports = {

	//// symbol keys

	Failure: '@metamaya-Failure',
	ParentObject: '@metamaya-ParentObject',


	Reduce: '@metamaya-Reduce',
	Lookup: '@metamaya-Lookup',
	Get: '@metamaya-Get',
	Define: '@metamaya-Define',
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