"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const phpunittest_1 = require("./phpunittest");
function activate(context) {
    let taskCommand = null;
    let problemMatcher = null;
    const outputChannel = vscode.window.createOutputChannel("phpunit");
    const PHPUnitTestRunner = new phpunittest_1.TestRunner(outputChannel, {
        setTaskCommand: (command, matcher) => {
            taskCommand = command;
            problemMatcher = matcher;
        }
    });
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.Test", () => {
        PHPUnitTestRunner.run("test");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestNearest", () => {
        PHPUnitTestRunner.run("nearest-test");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestSuite", () => {
        PHPUnitTestRunner.run("suite");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestDirectory", () => {
        PHPUnitTestRunner.run("directory");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestDirectory2", () => {
        PHPUnitTestRunner.run("directory2");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestDirectory3", () => {
        PHPUnitTestRunner.run("directory3");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.RerunLastTest", () => {
        PHPUnitTestRunner.run("rerun-last-test");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestingStop", () => {
        PHPUnitTestRunner.stop();
    }));
    context.subscriptions.push(vscode.tasks.registerTaskProvider("phpunit", {
        provideTasks: () => {
            return [
                new vscode.Task({ type: "phpunit", task: "run" }, vscode.TaskScope.Workspace, "run", "phpunit", new vscode.ShellExecution(taskCommand, {
                    env: vscode.workspace.getConfiguration('phpunit').envVars
                }), problemMatcher || "$phpunit")
            ];
        },
        resolveTask: undefined
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map