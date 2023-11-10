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
const nrc = require("node-run-cmd");
const docker = {
    container: {
        ls: () => __awaiter(void 0, void 0, void 0, function* () {
            let output = "";
            yield nrc.run("docker container ls", {
                onData: data => {
                    output += data;
                }
            });
            return output
                .split("\n")
                .filter(r => r)
                .reduce((acc, next, idx, arr) => {
                if (idx === 0) {
                    return acc; // First line is column names.
                }
                const names = arr[0].split(/\s{2,}/i);
                const values = next.split(/\s{2,}/i);
                const container = {};
                for (let i = 0; i < names.length; ++i) {
                    container[names[i]] = values[Math.min(i, values.length - 1)];
                }
                acc.push(container);
                return acc;
            }, []);
        })
    }
};
exports.default = docker;
//# sourceMappingURL=DockerCmdUtils.js.map