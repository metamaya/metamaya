# Installation

## Requirements

### Node.js

Required version: **4.4.7**

Earlier versions may also work, but not tested.

Recommended version for development: **6.3.1**

Node 6.3.1 fixes a bug in step&trace debugging
of symbol property functions.
See: [nodejs/node#7536](https://github.com/nodejs/node/issues/7536)

### Unix tools

**bash** is required by the `ohm-js` package on installation.


## Javascript check list

The following modern Javascript features are utilized by metamaya
(npm dependencies are not examined here).

### ES5

- Strict mode (all source code is strict mode Javascript)
- Function.property.bind

### ES6

- Symbol (symbols as property keys, global symbol registry)
- Map
- generator functions
- object literal extensions ( like in `{ f(n) { ... }, [S]: 3 }` ) 
- arrow functions
- for ... of
- const, let

You can find an exhaustive ES6 compatibility chart
[here](http://kangax.github.io/compat-table/es6/).
