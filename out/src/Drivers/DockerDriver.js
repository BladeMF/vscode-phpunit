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
const escapeRegexp = require("escape-string-regexp");
const vscode = require("vscode");
const PhpUnitResolver_1 = require("./PhpUnitResolver");
class Docker {
    constructor() {
        this.name = "Docker";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode.workspace.getConfiguration("phpunit");
            const dockerImage = config.get("docker.image") || "php";
            args = [
                "run",
                "--rm",
                "-t",
                "-v",
                "${pwd}:/app",
                "-w",
                "/app",
                dockerImage,
                "php",
                yield this.phpUnitPath()
            ]
                .concat(args)
                .join(" ")
                .replace(new RegExp(escapeRegexp(vscode.workspace.rootPath), "ig"), "/app")
                .replace(/\\/gi, "/")
                .split(" ");
            const command = `docker ${args.join(" ")}`;
            return {
                command: command,
                problemMatcher: "$phpunit-app"
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dockerExists = yield cmdExists("docker");
                return !!(dockerExists && (yield this.phpUnitPath()));
            }
            catch (e) {
                return false;
            }
        });
    }
    phpUnitPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.phpUnitPathCache ||
                (this.phpUnitPathCache = yield (0, PhpUnitResolver_1.resolvePhpUnitPath)()));
        });
    }
}
exports.default = Docker;
//# sourceMappingURL=DockerDriver.js.map