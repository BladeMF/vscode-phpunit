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
const vscode = require("vscode");
const PhpUnitResolver_1 = require("./PhpUnitResolver");
class Command {
    constructor() {
        this.name = "Command";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args = [yield this.phpUnitPath()].concat(args);
            const command = `${yield this.command()} ${args.join(" ")}`;
            return {
                command: command,
                problemMatcher: "$phpunit-app"
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!((yield this.command()) && (yield this.phpUnitPath()));
        });
    }
    command() {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.commandCache ||
                (this.commandCache = vscode.workspace
                    .getConfiguration("phpunit")
                    .get("command")));
        });
    }
    phpUnitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.phpUnitPathCache ||
                (this.phpUnitPathCache = vscode.workspace
                    .getConfiguration("phpunit")
                    .get("phpunit")) ||
                (this.phpUnitPathCache = yield (0, PhpUnitResolver_1.resolvePhpUnitPath)()));
        });
    }
}
exports.default = Command;
//# sourceMappingURL=CommandDriver.js.map