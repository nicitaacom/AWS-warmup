"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeEmailDomains = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// to determinate whether reply from @gmail.com or @domain.name is required
// DEPENDS ON VM-receiveEmails and OT (freeEmailDomains)
// 📁 Works because CommonJS has __dirname by default
const filePath = path_1.default.resolve(__dirname, "../../../freeEmailList.txt");
exports.freeEmailDomains = (0, fs_1.readFileSync)(filePath, "utf-8")
    .split("\n")
    .map(domain => domain.trim().toLowerCase())
    .filter(Boolean); // remove empty lines
