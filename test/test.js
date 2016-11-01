"use strict";

const mm = require("../lib/metamaya");
const test = require("tape");

test("arithmetic", (t) => {
	t.equal(testStr("start = -3"), -3);
	t.equal(testStr("start = 2 + 3"), 5);
	t.equal(testStr("start = 5 - 3"), 2);
	t.equal(testStr("start = 2 * 3"), 6);
	t.equal(testStr("start = 9 / 3"), 3);
	t.equal(testStr("start = 9 % 4"), 1);
	t.equal(testStr("start = 2 * 3 + 4 * 5"), 26);
	t.equal(testStr("start = 2 * (3 + 4) * 5"), 70);
	t.end();
});

test("string", (t) => {
	t.equal(testStr('start = a + b; a = "meta"; b = "maya"'), 'metamaya');
	t.end();
});

test("object", (t) => {
	t.deepEqual(testStr('start = {}'), {});
	t.deepEqual(testStr('start = { x = 3; y = 7; }'), { x: 3, y: 7 });
	t.equal(testStr('start = { x = 3; }.x'), 3);
	t.end();
});


test("static context", (t) => {
	t.equal(testStr("start = a; a = 3"), 3);
	t.equal(testStr("start = a.x; a = { x = 3; }"), 3);
	t.equal(testStr("start = a.b.y; a = { x = 3; b = { y = 7; } }"), 7);
	t.equal(testStr("start = a.b.y; a = { x = 3; b = { y = x; } }"), 3);
	t.equal(testFile("struct"), 9);
	t.end();
});

global.__mm_test_value__ = 33;

test("global context", (t) => {
	t.equal(testStr('start = __mm_test_value__'), 33);
	t.equal(testStr('start = Number("2")'), 2);
	t.equal(testStr('start = f(2) + f(3); f(x) = x * x'), 13);
	t.end();
});

test("function", (t) => {
	t.equal(testStr('start = f(2); f(x) = x * x'), 4);
	t.equal(testStr('start = f(2) + f(3); f(x) = x * x'), 13);
	t.equal(testStr('start = f(f(3)); f(x) = x * x'), 81);
	t.equal(testStr('start = f(g(3)); f(x) = x * x; g(x) = x + 2'), 25);
	t.end();
});


function testStr(str) {
	try {
		let mod = mm.compile(str);
		return mod.get('start').value();
	}
	catch (e) {
		return e;
	}
}


function testFile(name) {
	let path = "./test/mm/" + name + ".mm";
	try {
		let mod = mm.require(path);
		return mod.get('start').value();
	}
	catch (e) {
		return e;
	}
}
