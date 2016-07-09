"use strict"

const mm = require('./metamaya');

exports.isStrict = function isStrict(obj) {
	// plain Javascript values are all strict values,
	// so we should check for exceptions explicitely
	return !obj || !obj[mm.NonValue] && !obj[mm.Normalize];
}

exports.isNonStrict = function isNonStrict(obj) {
	return obj && obj[mm.Normalize];
}

exports.isValue = function isValue(obj) {
	return !obj || !obj[mm.NonValue];
}

exports.isNonValue = function isNonValue(obj) {
	return obj && obj[mm.NonValue];
}


