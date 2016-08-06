"use strict"

const mm = require('./implementation');
const EventEmitter = require('events');

// A debugger object that emits events when something important happens
// in the interpreter.
exports.Debugger = function Debugger() {
	EventEmitter.call(this);
}
exports.Debugger.prototype = {
	// Emits an event when an expression is reduced.
	onReduce(expr, result) {
		this.emit('reduce', expr, result);
	},
	// Emits an event when an expression can't be strictly evaluated.
	onBlocked(expr) {
		this.emit('blocked', expr);
	},
	// Emits an event before a program node property has been rewritten.
	beforeRewrite(node, key) {
		this.emit('beforeRewrite', node, key);
	},
	// Emits an event after a program node property has been rewritten.
	afterRewrite(node, key) {
		this.emit('afterRewrite', node, key);
	},
};
Object.setPrototypeOf(exports.Debugger.prototype, EventEmitter.prototype);
