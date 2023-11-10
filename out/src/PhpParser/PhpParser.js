"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const MemberTypes_1 = require("./MemberTypes");
class ParsedPhpClass {
    constructor() {
        this.properties = new MemberTypes_1.default();
        this.methods = new MemberTypes_1.default();
    }
}
function parsePhpToObject(phpClass) {
    const parsed = new ParsedPhpClass();
    const propertyRegex = /(public|protected|private) \$(.*) (?==)/g;
    let propertyMatches = propertyRegex.exec(phpClass);
    while (propertyMatches != null) {
        parsed.properties[propertyMatches[1]].push(propertyMatches[2]);
        propertyMatches = propertyRegex.exec(phpClass);
    }
    const methodRegex = /(public|protected|private) (.*function) (.*)(?=\()/g;
    let methodMatches = methodRegex.exec(phpClass);
    while (methodMatches != null) {
        parsed.methods[methodMatches[1]].push(methodMatches[3]);
        methodMatches = methodRegex.exec(phpClass);
    }
    return parsed;
}
function parse(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const phpClassAsString = yield new Promise((resolve, reject) => {
            fs.readFile(filePath, null, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.toString("utf8"));
                }
            });
        });
        const parsed = parsePhpToObject(phpClassAsString);
        parsed.name = path.basename(filePath, ".php");
        return parsed;
    });
}
exports.default = parse;
//# sourceMappingURL=PhpParser.js.map