"use strict"

const mm = require('./metamaya');
const EventEmitter = require('events');

// A debugger object that can be used in place of an evaluator.
// The debugger emits the following events:
// - rewrite: when a property of a term graph node has been rewritten
exports.Debugger = function Debugger() {
	EventEmitter.call(this);
}
exports.Debugger.prototype = {
	rewrite(node, key, value, oldValue) {
		this.emit('rewrite', node, key, value, oldValue);
	},
};
Object.setPrototypeOf(exports.Debugger.prototype, EventEmitter.prototype);
