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
const vscode = require("vscode");
const DockerCmdUtils = require("../DockerCmdUtils");
const PhpUnitResolver_1 = require("./PhpUnitResolver");
class DockerContainer {
    constructor() {
        this.name = "DockerContainer";
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args = [
                "exec",
                "-t",
                this.dockerContainer,
                "php",
                yield this.phpUnitPath()
            ].concat(args);
            const command = `docker ${args.join(" ").replace(/\\/gi, "/")}`;
            return {
                command: command,
                problemMatcher: "$phpunit-app"
            };
        });
    }
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = vscode.workspace.getConfiguration("phpunit");
                const pathMappings = config.get("paths");
                this.dockerContainer = config.get("docker.container");
                if (!this.dockerContainer && pathMappings) {
                    const containers = yield DockerCmdUtils.default.container.ls();
                    if (containers.length > 0) {
                        this.dockerContainer = yield vscode.window.showQuickPick(containers.map(r => r.NAMES), {
                            placeHolder: "Pick a running docker container to run phpunit test in..."
                        });
                        if (!this.dockerContainer) {
                            vscode.window.showInformationMessage(`No docker container selected. Skipping ${this.name} driver.`);
                        }
                    }
                }
                return !!(this.dockerContainer &&
                    pathMappings &&
                    (yield cmdExists("docker")) &&
                    (yield this.phpUnitPath()));
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
exports.default = DockerContainer;
//# sourceMappingURL=DockerContainerDriver.js.map