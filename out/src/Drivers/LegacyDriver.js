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
class Legacy {
    constructor() {
        this.name = "Legacy";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const execPath = yield this.execPath();
            const command = `${execPath} ${args.join(" ")}`;
            return {
                command: command
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this.execPath());
        });
    }
    execPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpPathCache) {
                return this.phpPathCache;
            }
            const config = vscode.workspace.getConfiguration("phpunit");
            return (this.phpPathCache = config.get("execPath"));
        });
    }
    phpUnitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
exports.default = Legacy;
//# sourceMappingURL=LegacyDriver.js.map