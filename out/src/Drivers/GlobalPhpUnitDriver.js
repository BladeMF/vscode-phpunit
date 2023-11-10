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
const os = require("os");
class GlobalPhpUnit {
    constructor() {
        this.name = "GlobalPhpUnit";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const execPath = yield this.phpUnitPath();
            const command = `${execPath} ${args.join(" ")}`;
            return {
                command: command
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this.phpUnitPath());
        });
    }
    phpUnitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phpUnitPathCache) {
                return this.phpUnitPathCache;
            }
            try {
                this.phpUnitPathCache =
                    os.platform() === "win32"
                        ? yield cmdExists("phpunit.bat")
                        : yield cmdExists("phpunit");
            }
            catch (e) { }
            return this.phpUnitPathCache;
        });
    }
}
exports.default = GlobalPhpUnit;
//# sourceMappingURL=GlobalPhpUnitDriver.js.map