import { Resend } from "resend"
import { Redis } from "ioredis"
import moment from "moment-timezone";
import { SchedulerClient,UpdateScheduleCommand,GetScheduleCommand } from "@aws-sdk/client-scheduler";

// CommonJS modules can always be imported via the default export (to prevent errors)
// import autodetailingEmailTemplatesModule from './dist/const/autodetailing.js';
// const { autodetailingEmailTemplates } = autodetailingEmailTemplatesModule;

import decryptResendModule from './dist/utils/decryptResend.js';
const { decryptResend } = decryptResendModule;


// render email using this function because you need each time render email async on client (on server .tsx not avaiable)
// DO NOT INSERT NEW LINES HERE - it may casuse unexpected output (its better to don't change this function - you may do it but do some backup before)
function renderedEmailString(body) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<table>
  <tbody>
    <tr>
      <td>
        <p style="white-space: pre-wrap; word-break: break-word; margin: 0 0 8px 0;">${body.trim()}</p>
      </td>
    </tr>
  </tbody>
</table>`;
}


const sendTelegramError = async (errorMessage) => {
  try {
    const response = await fetch(URI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        parse_mode: "html",
        text: errorMessage,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send Telegram message: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
};

function parseCronExpression(cronExpression) {
  const [minutes, hours, dayOfMonth, month, dayOfWeek, year] = cronExpression.split(" ");
  return { minutes, hours, dayOfMonth, month, dayOfWeek, year };
}

function calculateCronExpression(executionsPerDay) {
  const interval = Math.floor(1440 / executionsPerDay); // Minutes per day divided by executions
  return `*/${interval} * * * *`; // Generate cron for interval-based execution
}

function shouldUpdateSchedule(cronParts, daysDifference, emailCount) {
  if (emailCount < 2) {
    throw new Error("Invalid schedule: sendEmailsTo.length must be >= 2");
  }

  let newCronExpression;
  let emailsPerDay;

  switch (true) {
    case daysDifference >= 150:
      newCronExpression = "0 12 * * 1"; // Send 1 email per week on Monday at 12:00 PM
      break;
    case daysDifference >= 120:
      emailsPerDay = 100;
      break;
    case daysDifference >= 90:
      emailsPerDay = 80;
      break;
    case daysDifference >= 60:
      emailsPerDay = 50;
      break;
    case daysDifference >= 42:
      emailsPerDay = 30;
      break;
    case daysDifference >= 28:
      emailsPerDay = 20;
      break;
    case daysDifference >= 14:
      emailsPerDay = 10;
      break;
    default:
      return { isShouldUpdate: false }; // No update required
  }

  if (!newCronExpression) {
    const executionsPerDay = Math.ceil(emailsPerDay / emailCount);
    newCronExpression = calculateCronExpression(executionsPerDay);
  }

  const newCronParts = parseCronExpression(newCronExpression);
  const isShouldUpdate = JSON.stringify(cronParts) !== JSON.stringify(newCronParts);

  return { isShouldUpdate, newCronExpression: isShouldUpdate ? newCronExpression : undefined };
}

async function updateSchedule(schedulerClient, scheduleName, createdAt, sendEmailsTo, userTimezone, cronParts) {
  const createdAtMoment = moment(createdAt).tz(userTimezone);
  const now = moment().tz(userTimezone);
  const daysDifference = now.diff(createdAtMoment, "days");

  const { isShouldUpdate, newCronExpression } = shouldUpdateSchedule(cronParts, daysDifference, sendEmailsTo.length);

  if (!isShouldUpdate) {
    console.log(80, "No update required: Schedule already matches expected values");
    return;
  }

  try {
    const existingSchedule = await schedulerClient.send(
      new GetScheduleCommand({ Name: scheduleName })
    );

   // 1. Parse existing Target JSON
    let target = JSON.parse(JSON.stringify(existingSchedule.Target)); // Deep copy
    const newCronParts = parseCronExpression(newCronExpression); // Convert cron string to object

    // 2. Update only cronParts fields
    target.cronParts.minutes = newCronParts.minutes;
    target.cronParts.hours = newCronParts.hours;
    target.cronParts.dayOfMonth = newCronParts.dayOfMonth;
    target.cronParts.month = newCronParts.month;
    target.cronParts.dayOfWeek = newCronParts.dayOfWeek;
    target.cronParts.year = newCronParts.year || "*"; // Default year if undefined

    // 3. Update Redis so UI reflects changes
    const redis = new Redis(process.env.UPSTASH_REDIS_URL);
    await redis.set(process.env.WARMUP_KEY, JSON.stringify(target));

    console.log(88, "Updating schedule:", {
      scheduleName,
      daysDifference,
      newCronExpression,
    });

    // 4. Update EventBridge schedule (EB) so Lambda sees the change
    const updateScheduleCommand = new UpdateScheduleCommand({
      Name: scheduleName,
      GroupName: "warmup-group",
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: newCronExpression,
      ScheduleExpressionTimezone: existingSchedule.ScheduleExpressionTimezone,
      Target: target,
    });
    
    const result = await schedulerClient.send(updateScheduleCommand);
    console.log(118, "Schedule updated successfully:", result);
  } catch (error) {
    console.error(120, "Error updating schedule:", error);
    return error.message;
  }
}




async function sendEmail(resend,emailFrom,emailTo,subject,html) {
  const email = {
      from: emailFrom,
      to: emailTo,
      subject: subject,
      html: html,
    }

  const { error } = await resend.emails.send(email);
  console.log(125,'email sent')
  if (error) return error.message
}


export const handler = async (event) => {

  // created_at - it's ISO - to detect how much days smb warming up and to scale from 10 to 20 ... to 100 emails per day 
  // domain - to select schedule name to update warmup in EventBridge because - https://i.imgur.com/eD4ssVz.png
  // emailFrom - for resend so I send emails from email that needs to be warmed up
  // encryptedResend - so I can initialize resend SDK to send warm up emails (ChatGPT recommends 50-100 per day so consider resend limits)
  // cronParts - to update them for `warmup-${domain}` in EB event to show later on UI on OT AND to check should update EB or not
  // sendEmailsTo - to send warmup emails to someone (e.g myself)
  // checkEmail - to check if I'm in SPAM box or not (DO NOT user "Not spam" button on checkEmail)
  // niche - to send more realistic warmup emails
  // userTimezone - to send check email within timezone e.g 10:00 - so user understand whether CE on SPAM or not
  const { created_at, domain, emailFrom, encryptedResend, cronParts, sendEmailsTo, checkEmail, niche, userTimezone } = event;



  

 
 
   

  const requiredFields = [
    { key: created_at, name: "created_at" },
    { key: encryptedResend, name: "encryptedResend" },
    { key: emailFrom, name: "emailFrom" },
    { key: domain, name: "domain" },
    { key: cronParts, name: "cronParts" },
    { key: sendEmailsTo, name: "sendEmailsTo" },
    { key: checkEmail, name: "checkEmail" },
    { key: niche, name: "niche" },
    { key: userTimezone, name: "userTimezone" },
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
      // Send Telegram notification and return error response
      await sendTelegramError(errorMsg);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: errorMsg }),
      };
    }
  }






  try {
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









  
  // 2. Check do I need to scale volume of warming up
  const scheduleName = `warmup-${domain}`
  const updScheduleResp = await updateSchedule(schedulerClient,scheduleName, created_at, sendEmailsTo, userTimezone, cronParts)
  if (typeof updScheduleResp === 'string') throw Error(updScheduleResp,{cause:"updScheduleResp"})










  // 3. Send email for warmup 
  const emailTemplates = await import(`./dist/const/${niche}.js`).then(module => module.default);

  const emailTemplatesArray = Object.values(emailTemplates).flat();

  const randomTemplate = emailTemplatesArray[Math.floor(Math.random() * emailTemplatesArray.length)];
  let sendError = null;

  const currentTime = moment().tz(userTimezone);
  const checkEmailTime = {
    startTime: currentTime.clone().startOf("day").add(9, "hours").add(59, "minutes"),
    endTime: currentTime.clone().startOf("day").add(11, "hours"),
  };

  // Send email to checkEmail within times from 9:59 till 11 (userTimezone)
  if (currentTime.isBetween(checkEmailTime.startTime, checkEmailTime.endTime)) {
    const sendEmailResp = await sendEmail(resend, emailFrom, checkEmail, randomTemplate.subject, renderedEmailString(randomTemplate.body)) 
    if (typeof sendEmailResp === 'string') throw Error(sendEmailResp,{cause:"sendEmailResp"})
  }

  for (let i = 0; i < sendEmailsTo.length; i++) {
    const sendEmailResp = await sendEmail(resend, emailFrom, sendEmailsTo[i], randomTemplate.subject, renderedEmailString(randomTemplate.body)) 
    if (typeof sendEmailResp === 'string') {
      sendError = sendEmailResp
      break
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
    const errorMesage = 'Error in warmup lambda function - ' + error.message 
    console.log(292,errorMesage)
    return {
      statusCode:400,
      error:errorMesage
    } 
  }

};
