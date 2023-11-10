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
const path = require("path");
const vscode = require("vscode");
class Path {
    constructor() {
        this.name = "Path";
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
            return !!((yield this.phpPath()) && (yield this.phpUnitPath()));
        });
    }
    phpPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpPathCache) {
                return this.phpPathCache;
            }
            const config = vscode.workspace.getConfiguration("phpunit");
            try {
                this.phpPathCache = yield new Promise((resolve, reject) => {
                    const configPath = config.get("php");
                    if (fs.existsSync(configPath)) {
                        resolve(configPath);
                    }
                    else {
                        reject();
                    }
                });
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
            const config = vscode.workspace.getConfiguration("phpunit");
            const phpUnitPath = config.get("phpunit");
            this.phpUnitPathCache = !phpUnitPath
                ? null
                : yield new Promise((resolve, reject) => {
                    try {
                        fs.exists(phpUnitPath, exists => {
                            if (exists) {
                                this.phpUnitPathCache = phpUnitPath;
                                resolve(this.phpUnitPathCache);
                            }
                            else {
                                const absPhpUnitPath = path.join(vscode.workspace.rootPath, phpUnitPath);
                                fs.exists(absPhpUnitPath, absExists => {
                                    if (absExists) {
                                        this.phpUnitPathCache = absPhpUnitPath;
                                        resolve(this.phpUnitPathCache);
                                    }
                                    else {
                                        resolve();
                                    }
                                });
                            }
                        });
                    }
                    catch (e) {
                        resolve();
                    }
                });
            this.phpUnitPathCache = this.phpUnitPathCache
                ? `'${this.phpUnitPathCache}'`
                : this.phpUnitPathCache;
            return this.phpUnitPathCache;
        });
    }
}
exports.default = Path;
//# sourceMappingURL=PathDriver.js.map