"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warmup = void 0;
const client_scheduler_1 = require("@aws-sdk/client-scheduler");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const path_1 = require("path");
const freeEmailDomains_1 = require("../const/freeEmailDomains");
const extractEmailFromNameEmail_1 = require("../utils/extractEmailFromNameEmail");
const extractNameFromNameEmail_1 = require("../utils/extractNameFromNameEmail");
const WARMUP_CONFIG_1 = require("../const/WARMUP_CONFIG");
const randomNames_1 = require("../const/randomNames");
const randomMemes_1 = require("../const/randomMemes");
const client_ses_1 = require("@aws-sdk/client-ses");
// this setup assuming that user enable warmup just 1 time and will not enable it in the future (cuz it make no sence)
class Warmup {
    scheduler;
    redis;
    sesClient;
    openai;
    supabaseAdmin;
    constructor(scheduler, redis, sesClient, openai, supabaseAdmin) {
        this.scheduler = scheduler;
        this.redis = redis;
        this.sesClient = sesClient;
        this.openai = openai;
        this.supabaseAdmin = supabaseAdmin;
    }
    async replyToWarumEmailWithAI(warmupToUpdate) {
        // 1. selectDBWarmupEmails (string[] | string)
        const sentEmailsResp = await this.selectDBSentEmails(warmupToUpdate.domain);
        if (typeof sentEmailsResp === 'string')
            return `Error selecting warmup emails from DB: ${sentEmailsResp}`;
        // 2. 🌀 Pick a random email
        const randomIndex = Math.floor(Math.random() * sentEmailsResp.length);
        const randomBodyText = sentEmailsResp[randomIndex].body_text ?? null; // taken from same randomIndex so it belongs to 1 random email
        const randomSubject = sentEmailsResp[randomIndex].subject ?? null; // taken from same randomIndex so it belongs to 1 random email
        const randomRecipientEmail = sentEmailsResp[randomIndex].recipient_email ?? null;
        const randomSenderNameEmail = sentEmailsResp[randomIndex].sender_name_email ?? null;
        const randomTimestamp = sentEmailsResp[randomIndex].created_at ?? null;
        // Set role for ChatGPT and for user
        let messages = [
            {
                role: "system",
                // add more use cases like 'how to contact support'
                // answer should be short and informative because its toast and if answer will be long toast will be out of the screen
                content: `Your role is ${warmupToUpdate.niche} business owner
        You received an email and you need to reply to this email as human like as possible
        Pick random style of reply and random result (e.g positive negative or questioning or any other)
        DO NOT use placeholders like [Your Name] or [Your Roofing Business Name] and don't include Subject in response`,
            },
            {
                role: "user",
                content: randomBodyText,
            },
        ];
        const openAIResp = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });
        const aiResponseMsg = openAIResp.choices[0].message.content;
        if (!aiResponseMsg)
            return "No response - check 64";
        // then it's sent to not free domain - probably to some other EA (if so - use AI to reply)
        const recipientDomain = randomRecipientEmail.split("@")[1];
        const html = this.renderSIE(aiResponseMsg, {
            timestamp: randomTimestamp,
            name: (0, extractNameFromNameEmail_1.extractNameFromNameEmail)(randomSenderNameEmail),
            from: (0, extractEmailFromNameEmail_1.extractEmailFromNameEmail)(randomSenderNameEmail),
            body: randomBodyText
        });
        if (!freeEmailDomains_1.freeEmailDomains.includes(recipientDomain)) {
            const sentResp = await this.sendEmailAndInsertInDB('info', // reply from info@domain.name
            {
                from: randomRecipientEmail,
                subject: randomSubject,
                to: warmupToUpdate.emailFrom,
                html: html,
            });
            if (typeof sentResp === 'string')
                return sentResp;
        }
        // it's some free domain - reply with AI from gmail
        else {
            const ept = await this.redis.get('ept');
            const eprt = await this.redis.get('eprt');
            if (ept && eprt) {
                await this.sendGmail(ept, eprt, `"from" ${randomRecipientEmail}`, (0, extractEmailFromNameEmail_1.extractEmailFromNameEmail)(randomSenderNameEmail), randomSubject, html);
            }
            else
                return `it's no ept and/or eprt`;
        }
    }
    /**
   * updateSchedule
   *
   * Loads your warmup config from Redis, decides whether to scale up/down
   * and (re)write both Redis and the EventBridge schedule.
   *
   * @param {Redis}      redis          – Upstash Redis client
   * @param {SchedulerClient} scheduler – AWS EventBridge SchedulerClient
   * @param {string}     createdAt      – ISO timestamp when warmup started
   * @param {string}     scheduleName   – e.g. "warmup-example.com"
   * @param {string}     warmupState    – "enabled", "enabling-1/4", "disabling-2/4", etc.
   * @param {number}     recipientCount – how many target emails per invocation
   * @param {CronParts}  cronParts      – current parsed cron from EventBridge
   * @param {string}     timezone       – IANA tz, e.g. "Europe/Berlin"
   *
   * @example
   * // 1) Enabling case (immediate scale):
   * //    Day 2 of warmup, warmupState="enabling-1/4"
   * //    → scaleVolume bumps to X emails/day, we write Redis & EB right away.
   *
   * // 2) Disabling case (scheduled scale):
   * //    Day 35 of warmup, warmupState="enabled"
   * //    → checkScheduleUpdate sees daysElapsed>=30, nextState="disabling-1/4"
   * //       new cron & emails/day, reset updated_at, write Redis & EB.
   *
   * // 3) Just-enabled warmup (no change):
   * //    Day 5 of warmup, warmupState="enabled"
   * //    → daysElapsed<30, no nextState, cron stays same → no writes.
   *
   * Flow:
   * 1. Fetch warmups array from Redis and find the one matching `scheduleName`.
   * 2. Compute daysElapsed = now.tz(timezone) – createdAt.
   * 3. **If** warmupState startsWith "enabling":
   *      • scaleVolume → updatedWarmup
   *      • overwrite local `warmup` + `cronParts`
   *      • write Redis & EB
   * 4. Compute check = checkScheduleUpdate(cronParts, daysElapsed, …)
   * 5. **If** check.needsUpdate:
   *      • build updatedWarmup (apply factor for disabling, reset updated_at if phase changed)
   *      • write Redis & EB
   * 6. Done.
   *
   * Note: it make no sense to detect anomany in warmupCompletion (e.g if disabled manually by user from EB)
   * because if it's disabled from EB then this will not be executed (handleUpdateState handle warmupCompletion)
   */
    async updateSchedule(warmups, warmupToUpdate) {
        // 1. First things first - check if I need to change warmup state
        const prevWarmupState = warmupToUpdate.warmupState;
        warmupToUpdate.warmupState = this.handleUpdateState(warmupToUpdate);
        console.log(163, 'prevWarmupState - ', prevWarmupState);
        console.log(164, 'warmupToUpdate.warmupState - ', warmupToUpdate.warmupState);
        if (prevWarmupState === warmupToUpdate.warmupState)
            return; // 🧠 early return
        // 2. Scale volume if warmupState updated
        warmupToUpdate = this.handleVolumeScale(warmupToUpdate);
        // 3. Handle warmup completion
        if (warmupToUpdate.warmupState === 'disabled')
            warmupToUpdate.warmupCompletion = 'completed';
        // 3. Update reids&EB
        const updatedWarmups = warmups.map(w => w.id === warmupToUpdate.id ? warmupToUpdate : w);
        await this.redis.set('warmups', JSON.stringify(updatedWarmups));
        await this.updateEventBridgeSchedule(`warmup-${warmupToUpdate.domain}`, warmupToUpdate);
    }
    renderEmailStats(warmup) {
        const daysDifference = (0, moment_timezone_1.default)().tz(warmup.userTimezone).diff((0, moment_timezone_1.default)(warmup.created_at).tz(warmup.userTimezone), "days");
        const bgColorClass = this.getBgColorClass(warmup.warmupState);
        const { domain, created_at, userTimezone, cronParts, niche, warmupState } = warmup;
        return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <!-- Layer 1: Black parent background -->
    <div style="position: relative; background-color: #000000;">
      
    
      <!-- Layer 2: Gradient overlay with increased opacity (40%) -->
      <!-- Layer 3: Glares -->
      <!-- I don't use that because absolute and filter:blur doesn't work - so I need to use image but I don't want -->
   
      <!-- Layer 4: Table container -->
      <div style="position: relative; z-index: 3; padding: 3rem 0;">
        <table style="border-collapse: separate; border-spacing: 0; border: 1px solid; border-image: linear-gradient(to top right, white, gray) 1; border-radius: 8px; width: 100%;">
          <tr>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">Domain</td>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">${domain}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">Created At</td>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">
              ${(0, moment_timezone_1.default)(created_at).tz(userTimezone).format('DD.MM.YYYY [at] HH:mm')} ${userTimezone}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">Niche</td>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">${niche}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">Cron Parts</td>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">
              ${cronParts.minutes} ${cronParts.hours} ${cronParts.dayOfMonth} ${cronParts.month} ${cronParts.dayOfWeek} ${cronParts.year}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">Warmup State</td>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: ${bgColorClass}">${warmupState}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #fff; padding: 4px 8px; color: whitesmoke;">Warmup progress</td>
            <td style="border: 1px solid #fff; padding: 4px 8px;">
              <div style="margin-bottom: 4px; font-size: 0.9rem; color: whitesmoke;">${daysDifference}/${WARMUP_CONFIG_1.WARMUP_DURATION_DAYS}</div>
              <div style="width: 100%; border: 1px solid #eee; border-radius: 4px; overflow: hidden;">
                <div style="width: ${Math.min((daysDifference / WARMUP_CONFIG_1.WARMUP_DURATION_DAYS) * 100, 100)}%; background: linear-gradient(to right, whitesmoke, lightgray); height: 16px;"></div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
</html>
`;
    }
    // render email using this function because you need each time render email async on client (on server .tsx not avaiable)
    // DO NOT INSERT NEW LINES HERE - it may casuse unexpected output (its better to don't change this function - you may do it but do some backup before)
    renderWarmupEmail(body) {
        return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang='en'>
  <head>
    <meta charset='UTF-8'/>
  </head>
  <table>
    <tbody>
      <tr>
        <td>
          ${body.trim().replace(/\\n/g, '\n').replace(/\n/g, '<br>')}
        </td>
      </tr>
    </tbody>
  </table>
</html>`;
    }
    async getAllBS(warmup) {
        const currentTime = (0, moment_timezone_1.default)().tz(warmup.userTimezone);
        const randomWarmupEmail = await this.getRandomEmail(warmup.niche);
        const checkEmailTime = {
            startTime: currentTime.clone().startOf("day").add(9, "hours").add(59, "minutes"),
            endTime: currentTime.clone().startOf("day").add(12, "hours").add(1, "minutes"),
        };
        const formattedTodayDate = `${(0, moment_timezone_1.default)().tz(warmup.userTimezone).format('DD.MM.YYYY [at] HH:mm')} ${warmup.userTimezone}`;
        const isCurrTimeBetween = currentTime.isBetween(checkEmailTime.startTime, checkEmailTime.endTime);
        const isSendToCheckEmail = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * 100 < 10; // random 10%
        const isAIReply = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * 100 < 20; // random 20%
        const statsEmail = {
            from: `"warmup stats" <info@${warmup.domain}>`,
            to: warmup.checkEmail,
            subject: `stats for ${warmup.emailFrom} in ${warmup.niche} ${formattedTodayDate}`,
            html: this.renderEmailStats(warmup)
        };
        const warmupEmail = (emailTo) => {
            return {
                from: `"warmup" <warmup@${warmup.domain}>`,
                to: emailTo,
                subject: randomWarmupEmail.subject,
                html: this.renderWarmupEmail(randomWarmupEmail.body)
            };
        };
        return { isCurrTimeBetween, isSendToCheckEmail, statsEmail, isAIReply, warmupEmail };
    }
    sendEmailWithSES = async (email) => {
        try {
            const response = await this.sesClient.send(new client_ses_1.SendEmailCommand({
                Destination: { ToAddresses: [email.to] },
                Message: {
                    Subject: { Data: email.subject },
                    Body: { Html: { Data: email.html } },
                },
                Source: email.from, // must be verified in SES
            }));
            if (!response.MessageId)
                throw Error("It's no messageId returned from SES response");
            return { messageId: response.MessageId };
        }
        catch (error) {
            if (error instanceof Error)
                return `error sending email: ${error.message}`;
            return "error sending email: unknown";
        }
    };
    handleVolumeScale(warmupToUpdate) {
        const stageFactor = [...WARMUP_CONFIG_1.ENABLING_STAGES, ...WARMUP_CONFIG_1.DISABLING_STAGES].find(s => s.phase === warmupToUpdate.warmupState)?.factor || 1;
        // ⚠️ emailsPerDay is always ≥ 2 (up/down scale emails per day)
        const scaledEmailsPerDay = Math.max(2, Math.round(warmupToUpdate.emailsPerDay * stageFactor));
        // Create new cron expression based on scaled email volume
        const { cronParts, cronString } = this.generateCronExpression(scaledEmailsPerDay, warmupToUpdate.sendEmailsTo?.length || 1);
        return {
            ...warmupToUpdate,
            updated_at: (0, moment_timezone_1.default)().tz(warmupToUpdate.userTimezone).toISOString(),
            emailsPerDay: scaledEmailsPerDay,
            cronParts: cronParts,
        };
    }
    async selectDBSentEmails(domain) {
        const emailFoldersTable = `email-folders-${domain}`;
        const emailsTable = `emails-${domain}`;
        // 1️⃣ Get email IDs for the given folder
        const { data: folderRows, error: folderError } = await this.supabaseAdmin
            .from(emailFoldersTable)
            .select("email_id")
            .eq("folder_name", 'sent')
            .limit(10)
            .order('updated_at', { ascending: false });
        if (folderError)
            return `Error fetching folder 'sent' emails - ${folderError.message}`;
        const emailIds = folderRows?.map(row => row.email_id) ?? [];
        if (!emailIds.length)
            return [];
        // 2️⃣ Fetch emails using those IDs
        const { data: emails, error: emailError } = await this.supabaseAdmin
            .from(emailsTable)
            .select('body_text,subject,recipient_email,created_at,sender_name_email')
            .in("id", emailIds.slice(0, 10)) // to fix 414 Request-URI Too Large
            .ilike('sender_name_email', '%warmup%') // select sent warum emails only
            .order("updated_at", { ascending: false }) // from new to old
            .limit(10);
        if (emailError)
            return `Error selecting emails sent warmup emails from '${emailsTable}' - ${emailError.message}`;
        if (!emails?.length)
            return [];
        return emails;
    }
    async sendGmail(ept, eprt, nameEmailFrom, emailTo, emailSubject, emailHtml) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL}api/sendGmail`, {
            method: "POST",
            body: JSON.stringify({
                ept: ept,
                eprt: eprt,
                nameEmailFrom: nameEmailFrom,
                emailTo: emailTo,
                emailSubject: emailSubject,
                emailHtml: emailHtml
            }),
            headers: {
                "Content-Type": "application/json",
                "X-Forwarded-For": process.env.NEXT_PUBLIC_PRODUCTION_URL,
            },
            cache: "no-cache", // Should be no cache to improve security
        });
        if (!response.ok) {
            const errorMessage = await response.text(); // Get the error message from the response body
            return `Error sending gmail ${response.status}: ${errorMessage || "Unknown error"}`;
        }
    }
    escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    extractBodyContent(html) {
        const match = html.match(/<body[^>]*>((.|[\n\r])*)<\/body>/im);
        return match ? match[1] : html;
    }
    renderReplyBlockQuote(emailTimestamp, emailFromName, email, emailBody) {
        const rawBody = this.extractBodyContent(emailBody || "");
        return `
  <div>${this.escapeHtml(emailTimestamp)}, "${this.escapeHtml(emailFromName)}" &lt;${this.escapeHtml((0, extractEmailFromNameEmail_1.extractEmailFromNameEmail)(email))}&gt;:<br /></div>
  <blockquote style="border-left: 1px solid rgb(204, 204, 204); margin: 0px 0px 0px 0.8ex; padding-left: 1ex;">
    <table>
        <tbody>
            <tr>
                <td>
                    <p style="white-space: pre-wrap; word-break: break-word; margin: 0 0 8px 0;">${rawBody.trim()}</p>
                </td>
            </tr>
        </tbody>
    </table>
  </blockquote>
`;
    }
    renderSIE(initialEmailBody, originalEmail) {
        return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html lang='en'>
      <head>
        <meta charset='UTF-8'/>
      </head>
        <body>
          <table>
            <tbody>
              <tr>
                <td>
                  <p style="white-space: pre-wrap; word-break: break-word; margin: 0 0 8px 0;">${initialEmailBody.trim()}</p>
                  ${originalEmail ? this.renderReplyBlockQuote(originalEmail.timestamp, originalEmail.name, originalEmail.from, originalEmail.body) : ""}
                </td>
              </tr>
            </tbody>
          </table>
        <body>
    </html>
  `;
    }
    getBgColorClass = (warmupState) => {
        switch (warmupState) {
            case "enabled":
                return "#38c800"; // Deep Green
            case "enabling-1/4":
                return "#FFEB3B"; // Yellow
            case "enabling-2/4":
                return "#9CDA1E"; // Yellow-Green
            case "enabling-3/4":
                return "#6AD10F"; // Near Green
            case "disabling-1/4":
                return "#f8c003"; // Dark Yellow
            case "disabling-2/4":
                return "#FB6702"; // Intermediate Orange
            case "disabling-3/4":
                return "#FD3B01"; // Near Red
            case "disabled":
                return "#fe0e00"; // Red
            default:
                return "";
        }
    };
    async sendEmailAndInsertInDB(name, email) {
        let insertError = '';
        let sendError = '';
        const sesResp = await this.sendEmailWithSES(email);
        if (typeof sesResp === 'string')
            return sesResp;
        const cleanBody = this.htmlToCleanText(email.html);
        const normalizeIdTag = (id) => id.startsWith("<") ? id : `<${id}>`;
        // TODO - check how is that goes if I send from www.nicitaa.com
        const sentEmail = {
            id: sesResp.messageId,
            created_at: new Date().toISOString(),
            subject: email.subject,
            body_html: email.html,
            body_text: cleanBody,
            recipient_email: email.to,
            sender_name_email: `"${name}" <${email.from}>`,
            metric_name: null,
            is_read: true,
            attachments_count: 0,
            message_id: normalizeIdTag(sesResp.messageId),
            in_reply_to: null,
            references: normalizeIdTag(sesResp.messageId),
            thread_id: normalizeIdTag(sesResp.messageId)
        };
        // 6.1 Insert email record
        const { error: insert_error } = await this.supabaseAdmin
            .from(`emails-${email.from.split("@")[1]}`)
            .insert(sentEmail);
        if (insert_error)
            insertError = insert_error.message;
        const { error: insert_email_folders_error } = await this.supabaseAdmin
            .from(`email-folders-${email.from.split("@")[1]}`)
            .insert({
            email_id: sentEmail.id,
            folder_name: "sent"
        });
        if (insert_email_folders_error)
            insertError = insert_email_folders_error.message;
        if (sendError)
            return sendError;
        if (insertError)
            return insertError;
    }
    /**
     * Generates cron expression and parsed parts for EventBridge based on volume & recipient count
     * @param {number} emailsPerDay - Total emails to send per day
     * @param {number} recipientCount - Emails sent per execution
     * @returns {{cronString: string, cronParts: CronParts}} Cron string and parsed parts
     */
    generateCronExpression(emailsPerDay, recipientCount = 1) {
        const minInterval = 1;
        const maxMinuteInterval = 59;
        const validEmails = Math.max(Number(emailsPerDay) || 0, 1);
        const validRecipients = Math.max(Number(recipientCount) || 1, 1);
        const executions = Math.ceil(validEmails / validRecipients);
        const desiredInterval = executions > 0 ? 1440 / executions : 1440;
        let cronString = "";
        let minutes = "*";
        let hours = "*";
        if (desiredInterval <= maxMinuteInterval) {
            const interval = Math.max(Math.floor(desiredInterval), minInterval);
            cronString = `*/${interval} * * * ? *`;
            minutes = `*/${interval}`;
        }
        else {
            const hourlyInterval = Math.max(Math.floor(desiredInterval / 60), 1);
            const validHours = Array.from({ length: 24 / hourlyInterval }, (_, i) => i * hourlyInterval);
            cronString = `0 ${validHours.join(',')} * * ? *`;
            hours = validHours.join(',');
            minutes = "0";
        }
        const cronParts = {
            minutes,
            hours,
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "?",
            year: "*"
        };
        return { cronString, cronParts };
    }
    handleUpdateState(warmup) {
        const stages = [...WARMUP_CONFIG_1.ENABLING_STAGES, ...WARMUP_CONFIG_1.DISABLING_STAGES];
        const daysSinceCreated = (0, moment_timezone_1.default)().tz(warmup.userTimezone).diff(warmup.created_at, 'days');
        let dayCounter = 0;
        for (const stage of stages) {
            dayCounter += stage.durationDays;
            if (daysSinceCreated < dayCounter) {
                return stage.phase;
            }
        }
        return 'disabled';
    }
    async updateEventBridgeSchedule(scheduleName, updatedWarmup) {
        const existing = await this.scheduler.send(new client_scheduler_1.GetScheduleCommand({ Name: scheduleName, GroupName: 'warmup-group' }));
        const { cronString } = this.generateCronExpression(updatedWarmup.emailsPerDay, updatedWarmup.sendEmailsTo.length);
        await this.scheduler.send(new client_scheduler_1.UpdateScheduleCommand({
            Name: scheduleName,
            GroupName: 'warmup-group',
            FlexibleTimeWindow: { Mode: "OFF" },
            ScheduleExpression: `cron(${cronString})`,
            State: updatedWarmup.warmupState === 'disabled' ? 'DISABLED' : "ENABLED",
            ScheduleExpressionTimezone: existing.ScheduleExpressionTimezone,
            Target: {
                ...existing.Target,
                Input: JSON.stringify({ warmupId: updatedWarmup.id }),
                Arn: existing?.Target?.Arn,
                RoleArn: existing?.Target?.RoleArn
            }
        }));
    }
    async getRandomEmail(niche) {
        // keep .js because anyway it's going to be compiles TS to JS so it will use .js
        // const emailTemplates:{subject:string,body:string}[] = await import(`../const/${niche}.js`).then(module => module.default);
        const absolutePath = (0, path_1.join)(__dirname, "..", "const", `${niche}.js`); // ⬅️ real path
        const emailTemplates = await Promise.resolve(`${absolutePath}`).then(s => __importStar(require(s))).then(m => m.default); // ⬅️ no file://
        const emailTemplatesArray = Object.values(emailTemplates).flat();
        // Select a random email template from the array
        const template = emailTemplatesArray[Math.floor(Math.random() * emailTemplatesArray.length)];
        // Select a random name and a random meme URL
        const name = randomNames_1.randomNames[Math.floor(Math.random() * randomNames_1.randomNames.length)];
        const meme = randomMemes_1.randomMemes[Math.floor(Math.random() * randomMemes_1.randomMemes.length)];
        // Clone the template to avoid mutating the original object
        const email = {
            subject: template.subject,
            body: template.body,
        };
        // Replace placeholders in the subject
        email.subject = email.subject
            .replace("$[NAME]", name)
            .replace("$[LINK]", process.env.LINK)
            .replace("$[OWNER_NAME]", process.env.OWNER_NAME)
            .replace("$[COMPANY_NAME]", process.env.COMPANY_NAME);
        // Replace placeholders in the body, including the meme URL
        email.body = email.body
            .replace("$[NAME]", name)
            .replace("$[LINK]", process.env.LINK)
            .replace("$[OWNER_NAME]", process.env.OWNER_NAME)
            .replace("$[COMPANY_NAME]", process.env.COMPANY_NAME)
            .replace("$[MEME-URL]", meme);
        return email;
    }
    /**
     * Converts HTML to plain text for search functionality
     */
    htmlToCleanText(html) {
        if (!html)
            return '';
        // First pass - remove HTML structure and entities
        let clean = html
            .replace(/&nbsp;/g, ' ') // Convert &nbsp; to normal space
            .replace(/&(amp|lt|gt|quot|#39);/g, ' ') // Common HTML entities
            .replace(/&#\d+;/g, ' ') // Remove numeric HTML entities (like &#8199;)
            .replace(/<style[^>]*>.*?<\/style>/gis, ' ') // Remove CSS
            .replace(/<script[^>]*>.*?<\/script>/gis, ' ') // Remove JS
            .replace(/<[^>]+>/g, ' ') // Strip all HTML tags
            .replace(/\[REMOVED_INLINE_IMAGE\]/g, ''); // Remove placeholder
        // Second pass - clean special characters and whitespace
        return clean
            .replace(/[^\w\s.,!?@#$%^&*()\-+=:;'"<>{}[\]\\/]/g, ' ') // Keep basic punctuation
            .replace(/\s+/g, ' ') // Collapse all whitespace
            .substring(0, 10000) // Maintain your length limit
            .trim();
    }
}
exports.Warmup = Warmup;
