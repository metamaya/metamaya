# Compatibility

## Node.js

Required: v4.4.7

Recommended: v6.3.1

**Note:** Node v6.3.1 delivers a V8 bug fix related to step&trace debugging symbol property functions. (See: [nodejs/node#7536](https://github.com/nodejs/node/issues/7536))


## Modern Javascript features used in metamaya

All metamaya source code is strict mode Javascript. `"use strict"` is specified at the beginning of each file. 

The following features likely affect compatibility with older Javascript engines and browsers. Find compatibility table [here](http://kangax.github.io/compat-table/es6/).

### ES5

- Strict mode
- Function.property.bind

### ES6

- Symbol (symbols as property keys, global symbol registry)
- Map
- generator functions
- object literal extensions ( like in `{ f(n) { ... }, [S]: 3 }` ) 
- arrow functions
- for ... of
- const, let
