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
exports.TestRunner = void 0;
const escapeRegexp = require("escape-string-regexp");
const fs = require("fs");
const vscode = require("vscode");
const PhpUnitDrivers_1 = require("./Drivers/PhpUnitDrivers");
const PhpParser_1 = require("./PhpParser/PhpParser");
class TestRunner {
    constructor(channel, bootstrapBridge) {
        this.regex = {
            class: /class\s+(\w*)\s*\{?/gi,
            method: /\s*public*\s+function\s+(\w*)\s*\(/gi
        };
        this.channel = channel;
        this.bootstrapBridge = bootstrapBridge;
    }
    getClosestMethodAboveActiveLine(editor) {
        for (let i = editor.selection.active.line; i > 0; --i) {
            const line = editor.document.lineAt(i);
            let regexResult = this.regex.method.exec(line.text);
            if (regexResult) {
                return regexResult[1].toString().trim();
            }
            regexResult = this.regex.class.exec(line.text);
            if (regexResult) {
                return regexResult[1].toString().trim();
            }
        }
        return null;
    }
    resolveContextArgs(type, configArgs, config) {
        return __awaiter(this, void 0, void 0, function* () {
            let args = configArgs.slice();
            switch (type) {
                case "test": {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        if ("xml" === editor.document.languageId &&
                            editor.document.uri.path.match(/phpunit\.xml(\.dist)?$/)) {
                            if (yield this.resolveSuiteArgsAsync(args, editor.document.uri.fsPath, editor.document.getText())) {
                                break;
                            }
                        }
                        const range = editor.document.getWordRangeAtPosition(editor.selection.active);
                        if (range) {
                            const line = editor.document.lineAt(range.start.line);
                            const wordOnCursor = editor.document.getText(range);
                            const isFunction = line.text.indexOf("function") !== -1;
                            if (isFunction && wordOnCursor != null) {
                                // Test a specific function in this file
                                args.push(`'${editor.document.uri.fsPath}'`);
                                args.push("--filter");
                                args.push(wordOnCursor);
                                break;
                            }
                            else if (line.text.indexOf("class") !== -1) {
                                // Test the class.
                                args.push(`'${editor.document.uri.fsPath}'`);
                                break;
                            }
                        }
                        if (!config.preferRunClassTestOverQuickPickWindow) {
                            let testableList = [];
                            // Gather the class and functions to show in the quick pick window.
                            {
                                const closestMethod = this.getClosestMethodAboveActiveLine(editor);
                                if (closestMethod) {
                                    testableList.push("function - " + closestMethod);
                                }
                                const parsedPhpClass = yield (0, PhpParser_1.default)(editor.document.fileName);
                                testableList.push("class - " + parsedPhpClass.name);
                                testableList = testableList.concat(parsedPhpClass.methods.public.map(m => "function - " + m));
                            }
                            const selectedTest = yield vscode.window.showQuickPick(testableList);
                            if (selectedTest) {
                                if (selectedTest.indexOf("function - ") !== -1) {
                                    // Test the function.
                                    args.push(`'${editor.document.uri.fsPath}'`);
                                    args.push("--filter");
                                    args.push(selectedTest.replace("function - ", ""));
                                    break;
                                }
                                else if (selectedTest.indexOf("class - ") !== -1) {
                                    // Test the class.
                                    args.push(`'${editor.document.uri.fsPath}'`);
                                    break;
                                }
                            }
                            else {
                                // Make sure to return null args to indicate that we should not run any test.
                                return null;
                            }
                        }
                        // NOTE: No `break` statement here, we will fall-through to `nearest-test`.
                    }
                    else {
                        break;
                    }
                }
                case "nearest-test": {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const closestMethod = this.getClosestMethodAboveActiveLine(editor);
                        if (closestMethod) {
                            // Test the function.
                            args.push(`'${editor.document.uri.fsPath}'`);
                            args.push("--filter");
                            args.push(closestMethod);
                        }
                        else {
                            console.error("No method found above the cursor. Make sure the cursor is close to a method.");
                        }
                    }
                    break;
                }
                case "suite": {
                    const files = yield vscode.workspace.findFiles("**/phpunit.xml**", "**/vendor/**");
                    let selectedSuiteFile = files && files.length === 1 ? files[0].fsPath : null;
                    if (files && files.length > 1) {
                        selectedSuiteFile = yield vscode.window.showQuickPick(files.map(f => f.fsPath), { placeHolder: "Choose test suite file..." });
                    }
                    if (selectedSuiteFile) {
                        const selectedSuiteFileContent = yield new Promise((resolve, reject) => {
                            fs.readFile(selectedSuiteFile, "utf8", (err, data) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(data);
                                }
                            });
                        });
                        if (yield this.resolveSuiteArgsAsync(args, selectedSuiteFile, selectedSuiteFileContent)) {
                            break;
                        }
                    }
                    return null; // Don't run since user escaped out of quick pick.
                }
                case "directory": {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const currentDir = editor.document.uri.fsPath.replace(/(\/|\\)\w*\.php$/i, "");
                        args.push(`'${currentDir}'`);
                    }
                    else {
                        console.error("Please open a file in the directory you want to test.");
                    }
                    break;
                }
                case "directory2": {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const currentDir = editor.document.uri.fsPath.replace(/(\/|\\)\w*\.php$/i, "");
                        args.push(`'${currentDir}'/../`);
                    }
                    else {
                        console.error("Please open a file in the directory you want to test.");
                    }
                    break;
                }
                case "directory2": {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const currentDir = editor.document.uri.fsPath.replace(/(\/|\\)\w*\.php$/i, "");
                        args.push(`'${currentDir}'/../../`);
                    }
                    else {
                        console.error("Please open a file in the directory you want to test.");
                    }
                    break;
                }
                case "rerun-last-test": {
                    args = this.lastContextArgs.slice();
                    break;
                }
            }
            return args;
        });
    }
    getDriver(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const drivers = [
                new PhpUnitDrivers_1.default.Path(),
                new PhpUnitDrivers_1.default.Composer(),
                new PhpUnitDrivers_1.default.Phar(),
                new PhpUnitDrivers_1.default.GlobalPhpUnit(),
                new PhpUnitDrivers_1.default.Command(),
                new PhpUnitDrivers_1.default.DockerContainer(),
                new PhpUnitDrivers_1.default.Docker(),
                new PhpUnitDrivers_1.default.Ssh(),
                new PhpUnitDrivers_1.default.Legacy()
            ];
            function arrayUnique(array) {
                const a = array.concat();
                for (let i = 0; i < a.length; ++i) {
                    for (let j = i + 1; j < a.length; ++j) {
                        if (a[i] === a[j]) {
                            a.splice(j--, 1);
                        }
                    }
                }
                return a;
            }
            order = arrayUnique((order || []).concat(drivers.map(d => d.name)));
            const sortedDrivers = drivers.sort((a, b) => {
                return order.indexOf(a.name) - order.indexOf(b.name);
            });
            for (const d of sortedDrivers) {
                if (yield d.isInstalled()) {
                    return d;
                }
            }
            return null;
        });
    }
    run(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode.workspace.getConfiguration("phpunit");
            const order = config.get("driverPriority");
            const driver = yield this.getDriver(order);
            if (driver) {
                if (config.get("clearOutputOnRun")) {
                    this.channel.clear();
                }
                const configArgs = config.get("args", []);
                const preferRunClassTestOverQuickPickWindow = config.get("preferRunClassTestOverQuickPickWindow", false);
                const colors = config.get("colors");
                if (colors && (configArgs.indexOf(colors) === -1)) {
                    configArgs.push(colors);
                }
                const contextArgs = yield this.resolveContextArgs(type, configArgs, {
                    preferRunClassTestOverQuickPickWindow
                });
                if (contextArgs) {
                    const runArgs = (this.lastContextArgs = contextArgs);
                    this.channel.appendLine(`Running phpunit with driver: ${driver.name}`);
                    const runConfig = yield driver.run(runArgs);
                    runConfig.command = runConfig.command.replace(/\\/gi, "/");
                    const pathMappings = config.get("paths");
                    if (pathMappings) {
                        for (const key of Object.keys(pathMappings)) {
                            const localPath = key
                                .replace(/\$\{workspaceFolder\}/gi, vscode.workspace.rootPath)
                                .replace(/\\/gi, "/");
                            runConfig.command = runConfig.command.replace(new RegExp(escapeRegexp(localPath), "ig"), pathMappings[key]);
                        }
                    }
                    this.channel.appendLine(runConfig.command);
                    this.bootstrapBridge.setTaskCommand(runConfig.command, runConfig.problemMatcher);
                    yield vscode.commands.executeCommand("workbench.action.terminal.clear");
                    yield vscode.commands.executeCommand("workbench.action.tasks.runTask", "phpunit: run");
                    /*this.childProcess.stderr.on('data', (buffer: Buffer) => {
                                this.channel.append(buffer.toString());
                            });
                            this.childProcess.stdout.on('data', (buffer: Buffer) => {
                                this.channel.append(buffer.toString());
                            });*/
                }
            }
            else {
                console.error(`Wasn't able to start phpunit.`);
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("workbench.action.tasks.terminate", "phpunit: run");
            /*if (this.childProcess !== undefined)
                {
                    this.childProcess.kill('SIGINT');
                    this.channel.append("\nTesting Stop\n");
                    this.channel.show();
                }*/
        });
    }
    resolveSuiteArgsAsync(args, filePath, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            let testSuites = fileContent.match(/<testsuite[^>]+name="[^"]+">/g);
            if (testSuites) {
                testSuites = testSuites.map(v => v.match(/name="([^"]+)"/)[1]);
                if (testSuites.length > 1) {
                    const selectedSuite = yield vscode.window.showQuickPick(["Run All Test Suites...", ...testSuites], { placeHolder: "Choose test suite..." });
                    if (selectedSuite) {
                        const configArgsIdx = args.findIndex(a => /^(--configuration|-c)$/i.test(a));
                        if (configArgsIdx !== -1) {
                            this.channel.appendLine(`(--configuration|-c) already exists with ${args[configArgsIdx + 1]}, replacing with ${filePath}`);
                            args[configArgsIdx + 1] = filePath;
                        }
                        else {
                            args.push("-c");
                            args.push(filePath);
                        }
                        if (selectedSuite !== "Run All Test Suites...") {
                            args.push("--testsuite");
                            args.push(`'${selectedSuite}'`);
                        }
                        return true;
                    }
                }
                else if (testSuites.length === 1) {
                    const configArgsIdx = args.findIndex(a => /^(--configuration|-c)$/i.test(a));
                    if (configArgsIdx !== -1) {
                        this.channel.appendLine(`(--configuration|-c) already exists with ${args[configArgsIdx + 1]}, replacing with ${filePath}`);
                        args[configArgsIdx + 1] = filePath;
                    }
                    else {
                        args.push("-c");
                        args.push(filePath);
                    }
                    args.push("--testsuite");
                    args.push(`'${testSuites[0]}'`);
                    return true;
                }
            }
            return false;
        });
    }
}
exports.TestRunner = TestRunner;
//# sourceMappingURL=phpunittest.js.map