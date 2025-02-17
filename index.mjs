import { Resend } from "resend"
import { Redis } from "ioredis"
import moment from "moment-timezone";
import { SchedulerClient,UpdateScheduleCommand,GetScheduleCommand } from "@aws-sdk/client-scheduler";

// CommonJS modules can always be imported via the default export (to prevent errors)
// import autodetailingEmailTemplatesModule from './dist/const/autodetailing.js';
// const { autodetailingEmailTemplates } = autodetailingEmailTemplatesModule;

import decryptResendModule from './dist/utils/decryptResend.js';
const { decryptResend } = decryptResendModule;

import randomNamesModule from './dist/const/randomNames.js';
const { randomNames } = randomNamesModule;

import randomMemesModule from './dist/const/randomMemes.js';
const { randomMemes } = randomMemesModule;



// render email using this function because you need each time render email async on client (on server .tsx not avaiable)
// DO NOT INSERT NEW LINES HERE - it may casuse unexpected output (its better to don't change this function - you may do it but do some backup before)
function renderedEmailString(body) {
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




async function sendEmail(resend,emailFrom,emailTo,subject,html) {
  const email = {
      from: emailFrom,
      to: emailTo,
      subject: subject,
      html: html,
    }

  const { error } = await resend.emails.send(email);
  if (error) return error.message
}






































// -------------------------
// 2.1. scaleSendingVolume
// Updates warmup.cronParts based on warmupState to scale sending volume by a quarter
// -------------------------
export function scaleSendingVolume(warmupState, warmup, userTimezone) {
  let factor;
  switch (warmupState) {
    case "enabling-1/4": factor = 1 / 4; break;
    case "enabling-2/4": factor = 2 / 4; break;
    case "enabling-3/4": factor = 3 / 4; break;
    case "enabled":      factor = 1;     break;
    case "disabling-1/4": factor = 3 / 4; break;
    case "disabling-2/4": factor = 2 / 4; break;
    case "disabling-3/4": factor = 1 / 4; break;
    case "disabled":     factor = 0;     break;
    default:             factor = 1;     break;
  }
  // Use warmup.emailsPerDay if exists; otherwise assume 100 as baseline
  const baseline = warmup.emailsPerDay || 100;
  const newEmailsPerDay = Math.floor(baseline * factor);
  // Update cronParts based on newEmailsPerDay
  const newCronExpression = calculateCronExpression(newEmailsPerDay);
  warmup.cronParts = parseCronExpression(newCronExpression);
  warmup.emailsPerDay = newEmailsPerDay;
  warmup.updated_at = moment().tz(userTimezone).toISOString();
  return warmup;
}

// -------------------------
// Helper: updateEBSchedule
// Sends updated warmup (from Redis) to EventBridge schedule
// -------------------------
async function updateEBSchedule(schedulerClient, scheduleName, warmup) {
  // Get existing schedule to retain timezone info
  const existingSchedule = await schedulerClient.send(
    new GetScheduleCommand({ Name: scheduleName, GroupName: "warmup-group" })
  );
  await schedulerClient.send(
    new UpdateScheduleCommand({
      Name: scheduleName,
      GroupName: "warmup-group",
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: calculateCronExpression(warmup.emailsPerDay),
      ScheduleExpressionTimezone: existingSchedule.ScheduleExpressionTimezone,
      Target: { ...existingSchedule.Target, Input: JSON.stringify(warmup) },
    })
  );
}




function parseCronExpression(cronExpression) {
  const [minutes, hours, dayOfMonth, month, dayOfWeek, year] = cronExpression.split(" ");
  return { minutes, hours, dayOfMonth, month, dayOfWeek, year };
}

function calculateCronExpression(executionsPerDay) {
  const interval = Math.floor(1440 / executionsPerDay); // Minutes per day divided by executions
  return `*/${interval} * * * *`; // Generate cron for interval-based execution
}












// -------------------------
// Helper: getWarmupSendingSettings
// Returns newEmailsPerDay and newCronExpression based on daysDifference and recipient count.
// Recommended warmup period is 30 days. Before 30 days, ramp-up occurs gradually.
// -------------------------
function getWarmupSendingSettings(daysDifference, sendEmailsCount) {
  let newEmailsPerDay;
  switch (true) {
    // Early phase: Day 0-3 
    // send from 10 to 15 emails per day
    case (daysDifference <= 3):
      newEmailsPerDay = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
      break;
    // Early phase: Day 4-7 
    // send from 20 to 30 emails per day
    case (daysDifference <= 7):
      newEmailsPerDay = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
      break;
    // Early phase: Day 8-13 
    // send from 30 to 50 emails per day
    case (daysDifference < 14):
      newEmailsPerDay = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
      break;
    // Mid phase: Day 14-21 
    // send from 50 to 80 emails per day
    case (daysDifference < 22):
      newEmailsPerDay = Math.floor(Math.random() * (80 - 50 + 1)) + 50;
      break;
    // Late phase: Day 22-29 
    // send from 80 to 100 emails per day
    case (daysDifference < 30):
      newEmailsPerDay = Math.floor(Math.random() * (100 - 80 + 1)) + 80;
      break;
    // Warmup period ended (Day 30+)
    // transition to production: baseline between 100 and 120 emails per day
    case (daysDifference >= 30):
      newEmailsPerDay = Math.floor(Math.random() * (120 - 100 + 1)) + 100;
      break;
    default:
      newEmailsPerDay = 0;
  }
  const executionsPerDay = Math.ceil(newEmailsPerDay / sendEmailsCount);
  const newCronExpression = calculateCronExpression(executionsPerDay);
  return { newEmailsPerDay, newCronExpression };
}
// -------------------------
// Updated shouldUpdateSchedule function
// Slowly increases sending volume by adjusting emails per day and cronParts based on warmupToEnable.emailsPerDay.
// Uses switch-case for period-based logic and sets warmup state to "disabled-1/4" if warmup period (30 days) has ended.
// -------------------------
function shouldUpdateSchedule(cronParts, daysDifference, sendEmailsCount, currentWarmupState) {
  const { newEmailsPerDay, newCronExpression } = getWarmupSendingSettings(daysDifference, sendEmailsCount);
  const newCronParts = parseCronExpression(newCronExpression);
  const isShouldUpdate = JSON.stringify(cronParts) !== JSON.stringify(newCronParts);
  
  // If warmup period is ended and state is not yet updated, force update (caller should set state to "disabled-1/4")
  if (daysDifference >= 30 && currentWarmupState !== "disabled-1/4") {
    return { isShouldUpdate: true, newCronExpression, newEmailsPerDay };
  }
  
  return { isShouldUpdate, newCronExpression: isShouldUpdate ? newCronExpression : undefined, newEmailsPerDay };
}







// -------------------------
// 4. Main updateSchedule function
// -------------------------
export async function updateSchedule(
  redis,
  schedulerClient,
  createdAt,
  scheduleName,
  warmupState,
  sendEmailsTo,
  cronParts,
  userTimezone
) {
  // 1. Get warmup from Redis and parse it
  const warmupString = await redis.get(process.env.WARMUP_KEY);
  if (!warmupString) return console.log("Warmup not found in Redis.");
  let warmup = JSON.parse(warmupString);

  // 2. Calculate days difference using userTimezone
  const daysDifference = moment().tz(userTimezone).diff(
    moment(createdAt).tz(userTimezone),
    "days"
  );

  // 3. If state is transitional, scale sending volume and update EB, then return
  if (warmupState.startsWith("enabling") || warmupState.startsWith("disabling")) {
    warmup = scaleSendingVolume(warmupState, warmup, userTimezone);
    await redis.set(process.env.WARMUP_KEY, JSON.stringify(warmup));
    await updateEBSchedule(schedulerClient, scheduleName, warmup);
    return;
  }

 // 4. Otherwise, check if sending volume should be increased based on daysDifference
  const { isShouldUpdate, newCronExpression, newEmailsPerDay } = shouldUpdateSchedule(
    cronParts,
    daysDifference,
    sendEmailsTo.length,
    warmupState
  );
  if (!isShouldUpdate) return console.log("No update required: Schedule already matches expected values.");

  // 5. Update warmup's cronParts and emailsPerDay with newEmailsPerDay value returned by shouldUpdateSchedule
  const newCronParts = parseCronExpression(newCronExpression);
  warmup.cronParts = newCronParts;
  warmup.emailsPerDay = newEmailsPerDay;

  // 6. If warmup period is over (daysDifference >= 30), update warmupState to "disabled-1/4"
  if (daysDifference >= 30) {
    warmup.warmupState = "disabled-1/4";
  }
  
  // 7. Update Redis with the new warmup configuration
  await redis.set(process.env.WARMUP_KEY, JSON.stringify(warmup));

  // 8. Update EventBridge schedule with new cron expression and target data from updated warmup
  await updateEBSchedule(schedulerClient, scheduleName, warmup);
}













/* Insert the following helper function after the declaration of emailTemplatesArray */
async function createEmail(niche) {
    const emailTemplates = await import(`./dist/const/${niche}.js`).then(module => module.default);
 

  const emailTemplatesArray = Object.values(emailTemplates).flat();
  // Select a random email template from the array
  const template = emailTemplatesArray[Math.floor(Math.random() * emailTemplatesArray.length)];
  // Select a random name and a random meme URL
  const name = randomNames[Math.floor(Math.random() * randomNames.length)];
  const meme = randomMemes[Math.floor(Math.random() * randomMemes.length)];

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






















export const handler = async (event) => {

  // created_at - it's ISO - to detect how much days smb warming up and to scale from 10 to 20 ... to 100 emails per day 
  // warmupState - e.g "enabling-1/4" or "disabled" or "disabling-3/4" - explanation - https://i.imgur.com/WwEXEPE.png - https://i.imgur.com/Ex0SVqc.png
  // domain - to select schedule name to update warmup in EventBridge because - https://i.imgur.com/eD4ssVz.png
  // emailFrom - for resend so I send emails from email that needs to be warmed up
  // niche - to send more realistic warmup emails
  // sendEmailsTo - to send warmup emails to someone (e.g myself)
  // checkEmail - to check if I'm in SPAM box or not (DO NOT user "Not spam" button on checkEmail)
  // cronParts - to update them for `warmup-${domain}` in EB event to show later on UI on OT AND to check should update EB or not
  // encryptedResend - so I can initialize resend SDK to send warm up emails (ChatGPT recommends 50-100 per day so consider resend limits)
  // userTimezone - to send check email within timezone e.g 10:00 - so user understand whether CE on SPAM or not
  const { created_at, warmupState, domain, emailFrom, niche, sendEmailsTo, checkEmail, cronParts, encryptedResend, userTimezone } = event;
  // WARNING! - event - DEPENDS ON IWarmUp outreach-tool


 


 
 
  





  try {



 
  // --- IN TRY CATCH: Validate envs and variables from event --- //

  const requiredFields = [
    { key: created_at, name: "created_at" },
    { key: warmupState, name: "warmupState" },
    { key: domain, name: "domain" },
    { key: emailFrom, name: "emailFrom" },
    { key: niche, name: "niche" },
    { key: sendEmailsTo, name: "sendEmailsTo" },
    { key: checkEmail, name: "checkEmail" },
    { key: cronParts, name: "cronParts" },
    { key: encryptedResend, name: "encryptedResend" },
    { key: userTimezone, name: "userTimezone" },
    { key: process.env.LINK, name: "LINK", env: true },
    { key: process.env.OWNER_NAME, name: "OWNER_NAME", env: true },
    { key: process.env.COMPANY_NAME, name: "COMPANY_NAME", env: true },
    { key: process.env.REGION, name: "REGION", env: true },
    { key: process.env.ACCESS_KEY_ID, name: "ACCESS_KEY_ID", env: true },
    { key: process.env.SECRET_ACCESS_KEY, name: "SECRET_ACCESS_KEY", env: true },
    { key: process.env.UPSTASH_REDIS_URL, name: "UPSTASH_REDIS_URL", env: true },
    { key: process.env.WARMUP_KEY, name: "WARMUP_KEY", env: true },
  ];

  const ctaEnvs = `Check your envs in AWS Lambda warmup -> Configuration -> Environment variables`;
  const ctaEvent = `Check your event in AWS -> EventBridge -> warmup-yourdomain.com -> Target (contact support)`;

  for (const { key, name, env } of requiredFields) {
    if (!key) {
      const cta = env ? ctaEnvs : ctaEvent;
      const errorMsg = `${name} missing - ${cta}`;
      console.log(194, errorMsg);
      throw Error(errorMsg)
    }
  }

  if (!process.env.LINK.startsWith("https")) throw Error("should be https://your-appointment-booking.link (make sure it's https)")









   const decypredResend = await decryptResend(encryptedResend)
    
    // 1. Create SDKs
    const resend = new Resend(decypredResend.value);
    const schedulerClient = new SchedulerClient({
      region: process.env.REGION,
      credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
  const redis = new Redis(process.env.UPSTASH_REDIS_URL);








  
  // 2. Check do I need to up/down scale volume of warming up
  const scheduleName = `warmup-${domain}`
  const updScheduleResp = await updateSchedule(redis, schedulerClient, created_at, scheduleName, warmupState, sendEmailsTo, cronParts, userTimezone)
  if (typeof updScheduleResp === 'string') throw Error(updScheduleResp,{cause:"updScheduleResp"})










  // 3. Send email for warmup 
  let sendError = null;
  const currentTime = moment().tz(userTimezone);
  const checkEmailTime = {
    startTime: currentTime.clone().startOf("day").add(9, "hours").add(59, "minutes"),
    endTime: currentTime.clone().startOf("day").add(11, "hours"),
  };


 /* Replace the warmup email generation with: */
const checkEmailTemplate = await createEmail(niche);

/* Replace the warmup email sending block with: */
if (currentTime.isBetween(checkEmailTime.startTime, checkEmailTime.endTime)) {
  // Send warmup email during allowed time window (9:59 - 11:00 userTimezone)
  const sendEmailResp = await sendEmail(
    resend,
    emailFrom,
    checkEmail,
    checkEmailTemplate.subject,
    renderedEmailString(checkEmailTemplate.body)
  );
  if (typeof sendEmailResp === 'string') throw Error(sendEmailResp, { cause: "sendEmailResp" });
}

/* Replace the for-loop with: */
for (let i = 0; i < sendEmailsTo.length; i++) {
  // Generate a unique email for each recipient
  const recipientEmail = await createEmail(niche);
  const sendEmailResp = await sendEmail(
    resend,
    emailFrom,
    sendEmailsTo[i],
    recipientEmail.subject,
    renderedEmailString(recipientEmail.body)
  );
  if (typeof sendEmailResp === 'string') {
    sendError = sendEmailResp;
    break;
  }
}
  if (sendError) {
    throw new Error(sendError, { cause: "sendError" });
  }






    
    return {
      statusCode: 200,
      body: `Warmup email sent to:\n
        ${sendEmailsTo}\n
        Note: if email in spam you may click NOT SPAM in sendEmailsTo BUT NOT in checkEmail which is ${checkEmail}`
    }
    
  } catch (error) {
  const cleanErrorMessage = error.message
    .replace(/\\n/g, "\n") // Replace \\n with newline character
    .replace(/\\/g, '') // Remove backslashes
    .trim(); // Remove leading and trailing whitespace
  
 
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Failed to send warmup email - ${cleanErrorMessage}${error.cause ? `(${error.cause})` : ""}`,
    
      })
    } 
  }

};
