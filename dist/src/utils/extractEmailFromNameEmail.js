"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEmailFromNameEmail = void 0;
// Input: "Nikita <username@domain.com>"
// Output: "username@domain.com"
/**
 * Extracts email address from a "Name <email@domain.com>" format string
 * @param input The input string containing name and email
 * @returns The extracted email address or empty string if invalid
 */
function extractEmailFromNameEmail(nameEmail) {
    if (!nameEmail?.trim())
        return "";
    // 1. Try extracting from <email> format
    const angleMatch = nameEmail.match(/<([^<>]+@[^<>]+)>/);
    if (angleMatch)
        return angleMatch[1].trim();
    // 2. Try extracting from "email" format
    const quoteMatch = nameEmail.match(/"([^"]+@[^"]+)"/);
    if (quoteMatch)
        return quoteMatch[1].trim();
    // 3. Try extracting bare email if the string looks like an email
    const bareEmail = nameEmail.trim();
    if (/^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/.test(bareEmail)) {
        return bareEmail;
    }
    return "";
}
exports.extractEmailFromNameEmail = extractEmailFromNameEmail;
