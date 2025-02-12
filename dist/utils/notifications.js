"use strict";
// *************              **************** //
// ************* NOTICIATIONS **************** //
// *************              **************** //
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptResend = exports.renderErrorEmailString = exports.sendErrorNotifications = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const resend_1 = require("resend");
// ALL THIS STUFF DEPENDS ON VM-resetRedisStatsToday VM-sendScheduledEmail VM-sendFollowUpEmail
const sendTelegramErrorMessage = async (errorMessage, errorStackTrace) => {
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const errMsgTg = `<b>Error in VM-receiveEmails</b>\n`
        + `<code>${errorMessage}</code>\n\n`
        + `<b>Stack Trace:</b>\n`
        + `<pre>${errorStackTrace}</pre>\n`;
    try {
        const response = await fetch(URI_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                parse_mode: "html",
                text: errMsgTg,
            }),
        });
        if (!response.ok) {
            console.error(`Failed to send Telegram message: ${response.statusText}`);
        }
    }
    catch (error) {
        console.error("Error sending Telegram message:", error);
    }
};
const sendEmailError = async (errorMessage, errorStackTrace) => {
    try {
        if (!process.env.UPSTASH_REDIS_URL)
            throw Error("It's no UPSTASH_REDIS_URL");
        if (!process.env.SEND_EMAILS_TO)
            throw Error("It's no SEND_EMAILS_TO");
        if (!process.env.DOMAIN)
            throw Error("It's no DOMAIN");
        const redis = new ioredis_1.default(process.env.UPSTASH_REDIS_URL);
        const encryptedResend = await redis.get(`encryptedResend-${process.env.DOMAIN}`); // THIS DEPENDS ON redisKey (outreach-tool)
        if (!encryptedResend)
            throw Error("No encryptedResend returned from redis - contact support");
        const decryptedEnvResend = await decryptResend(encryptedResend);
        if (typeof decryptedEnvResend === 'string')
            throw Error(`Error decrypting resend - contact support (recreate email account first)
    error message:${decryptedEnvResend}`);
        const resend = new resend_1.Resend(decryptedEnvResend.value); // Resend defined outside VM
        const emailData = {
            from: `notifications@${process.env.DOMAIN}`,
            to: process.env.SEND_EMAILS_TO,
            subject: "VM-receiveEmails",
            html: renderErrorEmailString(errorMessage, errorStackTrace),
        };
        const { error: resend_error } = await resend.emails.send(emailData);
        if (resend_error)
            throw Error(resend_error.message);
    }
    catch (error) {
        if (error instanceof Error) {
            const cleanErrorMessage = error.message
                .replace(/\\n/g, "\n") // Replace \\n with newline character
                .replace(/\\/g, '') // Remove backslashes
                .trim(); // Remove leading and trailing whitespace
            const errorMessage = `<b>Error in VM-receiveEmails in sendEmailError</b>\n`
                + `<code>${cleanErrorMessage}</code>\n\n`
                + `<b>Stack Trace:</b>\n`
                + `<pre>${error.stack}</pre>\n`;
            return errorMessage;
        }
        return error;
    }
};
const sendDiscordErrorMessage = async (errorMessage, errorStackTrace) => {
    const errMsgDis = `
    **Error in VM-receiveEmails**
    \`\`\`
    ${errorMessage}
    \`\`\`
    **Stack Trace:**
    \`\`\`
    ${errorStackTrace}
    \`\`\`
  `.trim();
    try {
        if (!process.env.DISCORD_WEBHOOK_URL)
            throw Error("It's no DISCORD_WEBHOOK_URL");
        const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: errMsgDis }),
        });
        if (!response.ok) {
            console.error(`Failed to send Discord notification: ${response.statusText}`);
        }
    }
    catch (error) {
        console.error("Error sending Discord notification:", error);
    }
};
const sendTwilioSMSError = async (errorMessage, errorStackTrace) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        const toNumber = process.env.TWILIO_TO; // Ensure TWILIO_TO is set in your env variables
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        if (!accountSid || !authToken || !fromNumber || !toNumber) {
            throw new Error('Twilio environment variables are not set correctly.');
        }
        const body = new URLSearchParams({
            From: fromNumber,
            To: toNumber,
            Body: errorMessage,
        });
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });
        if (!response.ok) {
            console.error(`Failed to send Twilio SMS notification: ${response.statusText}`);
        }
    }
    catch (error) {
        console.error("Error sending Twilio SMS notification:", error);
    }
};
const sendErrorNotifications = async (errorMessage, errorStackTrace) => {
    const notificationPromises = [];
    const notificationsSentTo = [];
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        notificationPromises.push(sendTelegramErrorMessage(errorMessage, errorStackTrace));
        notificationsSentTo.push("Telegram");
    }
    if (process.env.UPSTASH_REDIS_URL && process.env.SEND_EMAILS_TO && process.env.DOMAIN) {
        notificationPromises.push(sendEmailError(errorMessage, errorStackTrace));
        notificationsSentTo.push("Email");
    }
    if (process.env.DISCORD_WEBHOOK_URL) {
        notificationPromises.push(sendDiscordErrorMessage(errorMessage, errorStackTrace));
        notificationsSentTo.push("Discord");
    }
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_TO) {
        notificationPromises.push(sendTwilioSMSError(errorMessage, errorStackTrace));
        notificationsSentTo.push("SMS");
    }
    await Promise.all(notificationPromises);
    return notificationsSentTo;
};
exports.sendErrorNotifications = sendErrorNotifications;
// --- For sending notifications using resend --- //
function renderErrorEmailString(emailBody, errorStackTrace) {
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
        timeZone: "GMT",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).replace(",", " at");
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<table>
  <tbody>
    <tr>
    
      <td style="color: white;">
        <p>Error time: ${formattedDate} (GMT)</p>
      </td>
    </tr>
    <br/>
    <tr>
      <td>
        <b>Error:</b><br/>
        <p>${emailBody.trim()}</p><br/>
        <b>Stack trace:</b><br/>
        <code>${errorStackTrace}</code>
      </td>
    </tr>
  </tbody>
</table>`;
}
exports.renderErrorEmailString = renderErrorEmailString;
async function decryptResend(encryptedResendEnvValue) {
    try {
        const secretKey = JSON.stringify({
            secret: "DB",
            provider: "resend",
            APIKey: "someAPIKeyHere",
        });
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        // Decode base64 to Uint8Array
        const encryptedData = Buffer.from(encryptedResendEnvValue, "base64");
        // Extract the salt, iv, and encrypted content
        const salt = encryptedData.slice(0, 16);
        const iv = encryptedData.slice(16, 28);
        const encrypted = encryptedData.slice(28);
        const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(secretKey), { name: "PBKDF2" }, false, [
            "deriveKey",
        ]);
        // Derive the key
        const key = await crypto.subtle.deriveKey({
            name: "PBKDF2",
            salt: salt,
            iterations: 310000,
            hash: "SHA-256",
        }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
        // Decrypt the data
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted);
        // Parse the decrypted data as JSON to extract key-value object
        const decodedText = decoder.decode(decrypted);
        const result = JSON.parse(decodedText);
        // Ensure the object contains only key and value fields
        if (Object.keys(result).length !== 2 || !('key' in result) || !('value' in result)) {
            return "error: decrypted object must contain only key and value fields";
        }
        return { key: result.key, value: result.value };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during decryption.";
        return `Decryption failed: ${errorMessage}`;
    }
}
exports.decryptResend = decryptResend;
