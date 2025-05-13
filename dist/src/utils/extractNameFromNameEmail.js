"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNameFromNameEmail = void 0;
/**
 * Extracts name from a "Name <email@domain.com>" format string
 * @param input The input string containing name and email
 * @returns The extracted name or empty string if no name found
 */
function extractNameFromNameEmail(input) {
    if (!input?.trim())
        return "";
    // 1. Extract name from "Name <email>" format
    const angleFormatMatch = input.match(/^([^<]+)\s*<[^>]+>$/);
    if (angleFormatMatch) {
        const name = angleFormatMatch[1].trim();
        // Handle quoted names (e.g., "John Doe" <email>)
        return name.replace(/^"(.*)"$/, "$1").trim();
    }
    // 2. Extract name from email format (name@domain)
    if (!input.includes("@")) {
        return input.trim();
    }
    return "";
}
exports.extractNameFromNameEmail = extractNameFromNameEmail;
