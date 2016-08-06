"use strict"

const fs = require("fs");
const path = require("path");
const ohm = require("ohm-js");

buildParser();


function buildParser() {
	console.log("Building parser recipe...");

	let parserPath = path.join(__dirname, '../ohm/parser.ohm');
	let recipePath = path.join(__dirname, "../ohm/recipe.js");

	let parser = ohm.grammar(fs.readFileSync(parserPath)/*, { Lexer: lexer }*/);
	let recipe = parser.toRecipe();

	fs.writeFileSync(recipePath, recipe, { encoding: "utf-8" });
	console.log("Done.");
}
