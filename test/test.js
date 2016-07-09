"use strict"

const mm = require("../lib/metamaya");
const test = require("tape");

test("arithmetic", (t) => {
	t.equal(testStr("start = 2 + 3"), 5);
	t.equal(testStr("start = 5 - 3"), 2);
	t.equal(testStr("start = 2 * 3"), 6);
	t.equal(testStr("start = 9 / 3"), 3);
	t.equal(testStr("start = 9 % 4"), 1);
	t.equal(testStr("start = 2 * 3 + 4 * 5"), 26);
	t.equal(testStr("start = 2 * (3 + 4) * 5"), 70);
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


function testStr(str) {
	try {
		let mod = mm.compile(str);
		return mm.evalProperty(mod, "start");
	}
	catch (e) {
		return e;
	}
}


function testFile(name) {
	let path = "./test/mm/" + name + ".mm";
	try {
		let mod = mm.loadModule(path);
		return mm.evalProperty(mod, "start");
	}
	catch (e) {
		return e;
	}
}
