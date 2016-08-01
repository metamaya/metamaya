"use strict"

const mm = require('./implementation');
const EventEmitter = require('events');

// A debugger object that can be used in place of an evaluator.
// The debugger emits the following events:
// - rewrite: when a property of a term graph node has been rewritten
exports.Debugger = function Debugger() {
	EventEmitter.call(this);
}
exports.Debugger.prototype = {
	beforeRewrite(node, key) {
		this.emit('beforeRewrite', node, key);
	},
	afterRewrite(node, key) {
		this.emit('afterRewrite', node, key);
	},
};
Object.setPrototypeOf(exports.Debugger.prototype, EventEmitter.prototype);
