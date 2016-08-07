# Metamaya

Metamaya is a declarative programming language with minimal syntax.

The language is currently rather simple,
but more exciting features are on the roadmap:

- lazy evaluation
- pattern matching
- cyclic dependency detection
- optional typing...

## Installation

In node.js:
~~~
npm install metamaya
~~~

## Usage

In `example.mm`:

~~~
a = b.x;
b = {
    x = 1;
}
~~~

In Javascript:

~~~js
var mm = require("metamaya");
var example = mm.require("./example.mm");
console.log(example.get('a').value());
~~~

Output:

~~~
1
~~~

Alternatively, you can compile a string directly.

~~~js
var mod = mm.compile("x = 3*3");
console.log(mod.get('x').value()); // 9
~~~

## Quick tour

Names are statically scoped in metamaya programs.
As reassignment is not allowed, a name is simply defined
by assigning a value to it.

~~~
a = b.c.y; // 1
b = {
    x = 1;
    c = { y = x; }  // x comes from the enclosing scope
}
~~~

You can do the usual arithmetics.
As you have probably noticed, names can be accessed before the place of definition.

~~~
a = (x + y) * (x - y); // -5
x = 2;
y = 3;
~~~

Metamaya operators are simply Javascript operators,
so you can guess what happens when two strings are added up.

~~~
a = "meta";
b = "maya";
mm = a + b; // "metamaya"
~~~

The Javascript global context can be accessed from metamaya code.

~~~
a = Number("2"); // 2
~~~

You can easily define your own functions too.

~~~
sqr(x) = x * x
a = sqr(3); // 9
~~~

----

That's all for now.
Please note that metamaya is in a very early phase, so anything may change the next week.