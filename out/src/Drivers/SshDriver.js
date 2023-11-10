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
class Ssh {
    constructor() {
        this.name = "Ssh";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const argsString = `${this.phpPathCache} ${this.phpUnitPathCache} ${args.join(" ")}`;
            return {
                command: `${this.ssh.replace("<command>", argsString)}`,
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode.workspace.getConfiguration("phpunit");
            this.ssh = config.get("ssh");
            return !!(this.ssh && (yield this.phpPath()) && (yield this.phpUnitPath()));
        });
    }
    phpPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpPathCache) {
                return this.phpPathCache;
            }
            const config = vscode.workspace.getConfiguration("phpunit");
            this.phpPathCache = config.get("php", "php"); // Use default `php` for this driver since we probably can assume `php` is on path.
            return this.phpPathCache;
        });
    }
    phpUnitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpUnitPathCache) {
                return this.phpUnitPathCache;
            }
            const config = vscode.workspace.getConfiguration("phpunit");
            this.phpUnitPathCache = config.get("phpunit");
            return (this.phpUnitPathCache ||
                (this.phpUnitPathCache = yield (0, PhpUnitResolver_1.resolvePhpUnitPath)()));
        });
    }
}
exports.default = Ssh;
//# sourceMappingURL=SshDriver.js.map