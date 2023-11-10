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
const cmdExists = require("command-exists");
const fs = require("fs");
const os = require("os");
const vscode = require("vscode");
class Composer {
    constructor() {
        this.name = "Composer";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let execPath = yield this.phpUnitPath();
            if (os.platform() === "win32") {
                execPath = yield this.phpPath();
                args = [yield this.phpUnitPath()].concat(args);
            }
            const command = `${execPath} ${args.join(" ")}`;
            return {
                command: command
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!((yield this.phpPath()) != null && (yield this.phpUnitPath()) != null);
        });
    }
    phpPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpPathCache) {
                return this.phpPathCache;
            }
            const config = vscode.workspace.getConfiguration("phpunit");
            try {
                this.phpPathCache = yield cmdExists(config.get("php"));
            }
            catch (e) {
                try {
                    this.phpPathCache = yield cmdExists("php");
                }
                catch (e) { }
            }
            return this.phpPathCache;
        });
    }
    phpUnitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpUnitPathCache) {
                return this.phpUnitPathCache;
            }
            const findInWorkspace = () => __awaiter(this, void 0, void 0, function* () {
                const uris = os.platform() === "win32"
                    ? yield vscode.workspace.findFiles("**/vendor/phpunit/phpunit/phpunit", "**/node_modules/**", 1)
                    : yield vscode.workspace.findFiles("**/vendor/bin/phpunit", "**/node_modules/**", 1);
                return (this.phpUnitPathCache =
                    uris && uris.length > 0 ? uris[0].fsPath : null);
            });
            const config = vscode.workspace.getConfiguration("phpunit");
            const phpUnitPath = config.get("phpunit");
            if (phpUnitPath) {
                this.phpUnitPathCache = yield new Promise((resolve, reject) => {
                    fs.exists(phpUnitPath, exists => {
                        if (exists) {
                            resolve(phpUnitPath);
                        }
                        else {
                            reject();
                        }
                    });
                }).catch(findInWorkspace);
            }
            else {
                this.phpUnitPathCache = yield findInWorkspace();
            }
            this.phpUnitPathCache = this.phpUnitPathCache
                ? `'${this.phpUnitPathCache}'`
                : this.phpUnitPathCache;
            return this.phpUnitPathCache;
        });
    }
}
exports.default = Composer;
//# sourceMappingURL=ComposerDriver.js.map