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
const cp = require("child_process");
const cmdExists = require("command-exists");
const fs = require("fs");
const vscode = require("vscode");
class Phar {
    constructor() {
        this.name = "Phar";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const execPath = yield this.phpPath();
            args = [yield this.phpUnitPath()].concat(args);
            const command = `${execPath} ${args.join(" ")}`;
            return {
                command: command
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!((yield this.phpPath()) &&
                (yield this.hasPharExtension()) &&
                (yield this.phpUnitPath()));
        });
    }
    hasPharExtension() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasPharExtensionCache) {
                return this.hasPharExtensionCache;
            }
            return (this.hasPharExtensionCache = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                cp.exec(`${yield this.phpPath()} -r "echo extension_loaded('phar');"`, (err, stdout, stderr) => {
                    resolve(stdout === "1");
                });
            })));
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
            if (this.phpUnitPharPathCache) {
                return this.phpUnitPharPathCache;
            }
            const findInWorkspace = () => __awaiter(this, void 0, void 0, function* () {
                const uris = yield vscode.workspace.findFiles("**/phpunit*.phar", "**/node_modules/**", 1);
                this.phpUnitPharPathCache =
                    uris && uris.length > 0 ? uris[0].fsPath : null;
                return this.phpUnitPharPathCache;
            });
            const config = vscode.workspace.getConfiguration("phpunit");
            const phpUnitPath = config.get("phpunit");
            if (phpUnitPath && phpUnitPath.endsWith(".phar")) {
                this.phpUnitPharPathCache = yield new Promise((resolve, reject) => {
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
                this.phpUnitPharPathCache = yield findInWorkspace();
            }
            this.phpUnitPharPathCache = this.phpUnitPharPathCache
                ? `'${this.phpUnitPharPathCache}'`
                : this.phpUnitPharPathCache;
            return this.phpUnitPharPathCache;
        });
    }
}
exports.default = Phar;
//# sourceMappingURL=PharDriver.js.map