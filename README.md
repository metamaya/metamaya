# Metamaya

Metamaya is a declarative programming language with minimal syntax.

Javascript is a surprisingly good target language for metaprogramming.
Metamaya provides an expressive program model and concise syntax to make
metaprogramming even more enjoyable and productive.

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
console.log(mod.get('x').value()); // => 9
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

~~~
a = (x + y) * (x - y); // => -5
x = 2;
y = 3;
~~~

Metamaya operators are simply Javascript operators,
so you can guess what happens when two strings are added up.

~~~
mm = a + b; // => "metamaya"
a = "meta";
b = "maya";
~~~

As you may have noticed, names can be accessed before the place of definition.
This is a very powerful aspect of the language that gives you much more
freedom than *hoisting* in Javascript.
Actually your definitions can be placed in any order as long as their 
dependencies can be resolved, pretty much like the cells of a spreadsheet.

The Javascript global context can be accessed from metamaya code.

~~~
a = Number("2"); // => 2
~~~

You can easily define your own functions too.

~~~
sqr(x) = x * x
a = sqr(3); // => 9
~~~

----

That's all for now.
Please note that metamaya is in a very early phase, so anything may change the next week.