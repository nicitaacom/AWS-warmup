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

const DISABLE_STAGE_DURATION = 3; // 3 days per disabling stage
const WARMUP_DURATION_DAYS = 30;
const MAX_DAILY_EMAILS = 80;
const DISABLE_STAGES = [
  { phase: 'disabling-1/4', factor: 0.75, duration: 3 },
  { phase: 'disabling-2/4', factor: 0.5, duration: 3 },
  { phase: 'disabling-3/4', factor: 0.25, duration: 3 },
  { phase: 'disabled', factor: 0, duration: 0 }
];


const getBgColorClass = (warmupState) => {
  switch (warmupState) {
    case "enabled":
      return "#38c800" // Deep Green
    case "enabling-1/4":
      return "#FFEB3B" // Yellow
    case "enabling-2/4":
      return "#9CDA1E" // Yellow-Green
    case "enabling-3/4":
      return "#6AD10F" // Near Green
    case "disabling-1/4":
      return "#f8c003" // Dark Yellow
    case "disabling-2/4":
      return "#FB6702" // Intermediate Orange
    case "disabling-3/4":
      return "#FD3B01" // Near Red
    case "disabled":
      return "#fe0e00" // Red
    default:
      return ""
  }
}


function renderEmailStats(domain, created_at, userTimezone, niche, cronParts, warmupState) {
  const daysDifference = moment().tz(userTimezone).diff(moment(created_at).tz(userTimezone),"days")
  const bgColorClass = getBgColorClass(warmupState);
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
              ${moment(created_at).tz(userTimezone).format('DD.MM.YYYY [at] HH:mm')} ${userTimezone}
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
              <div style="margin-bottom: 4px; font-size: 0.9rem; color: whitesmoke;">${daysDifference}/${WARMUP_DURATION_DAYS}</div>
              <div style="width: 100%; border: 1px solid #eee; border-radius: 4px; overflow: hidden;">
                <div style="width: ${Math.min((daysDifference / WARMUP_DURATION_DAYS) * 100, 100)}%; background: linear-gradient(to right, whitesmoke, lightgray); height: 16px;"></div>
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
function renderedEmailWarmup(body) {
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



/* Insert the following helper function after the declaration of emailTemplatesArray */
async function getRandomEmail(niche) {
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
  }

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











































































// -------------------------
// 2.1. scaleSendingVolume
// Updates warmup.cronParts based on warmupState to scale sending volume by a quarter
// -------------------------

// 4. Implementation understanding:
/*
1. Email Distribution:
   - 80 max emails ÷ 2 recipients = 40 emails/recipient (40x2=80)
   - 80 ÷ 4 recipients = 20 emails/recipient (20x4=80)
   - Uneven division: 85 emails ÷ 3 recipients → 28x3=84 (floor division)

2. Warmdown Process:
   Days 1-30: Normal warmup progression
   Day 31: Start disabling-1/4 (75% of 80 = 60 emails)
   Day 38: Auto-transition to disabling-2/4 (50% = 40 emails)
   Day 45: Auto-transition to disabling-3/4 (25% = 20 emails)
   Day 52: Auto-disable completely

3. Execution Schedule:
   - 60 emails with 2 recipients = 30 executions (30x2=60)
   - cron(*/ /*48 * /* /* ? /*) = every 48 minutes (1440/30=48)
*/




/**
 * Caps email volume between 0 and MAX_DAILY_EMAILS
 * @param {number} volume - Raw email volume
 * @returns {number} Capped volume
 */
function capEmailVolume(volume) {
  return Math.min(Math.max(volume, 0), MAX_DAILY_EMAILS);
}

// 5. State transition logic
function getNextDisableState(currentState, daysInState) {
  const currentIndex = DISABLE_STAGES.findIndex(s => s.phase === currentState);
  if (currentIndex === -1) return null;
  
  // Use current stage's duration instead of global constant
  const currentStage = DISABLE_STAGES[currentIndex];
  if (daysInState < currentStage.duration) return null;
  
  return DISABLE_STAGES[Math.min(currentIndex + 1, DISABLE_STAGES.length - 1)].phase;
}


/**
 * Parses cron expression into components
 * @example
 * parseCronExpression('*\5 * * * *') // returns { minutes: '5', hours: '*'... }
 * @param {string} expression - Cron expression
 * @returns {CronParts} Parsed components
 */
function parseCronExpression(expression) {
  // Clean AWS cron() wrapper if present
  const cleaned = expression.replace(/^cron\(|\)$/g, '');
  const [minutes, hours, dayOfMonth, month, dayOfWeek, year] = cleaned.split(' ');
  
  return {
    minutes: minutes.replace('*/', '') || '*',
    hours: hours || '*',
    dayOfMonth: dayOfMonth || '*',
    month: month || '*',
    dayOfWeek: dayOfWeek || '?',
    year: year || '*'
  }
}
/**
 * Generates cron expression for EventBridge based on email volume and recipient count
 * @example 
 * // 30 emails/day with 2 recipients = 15 executions → 96 minute intervals
 * generateCronExpression(30, 2) // returns "*\/15 * * * ? *"
 * @param {number} emailsPerDay - Total desired emails per day
 * @param {number} recipientCount - Number of email recipients
 * @returns {string} Valid AWS cron expression
 */
function generateCronExpression(emailsPerDay, recipientCount = 1) {
  const minInterval = 1;
  const maxMinuteInterval = 59;
  
  // Validate inputs
  const validEmails = Number(emailsPerDay) || 0;
  const validRecipients = Math.max(Number(recipientCount), 1);

  // Calculate executions needed
  const executions = Math.ceil(validEmails / validRecipients);
  const desiredInterval = executions > 0 ? 1440 / executions : 1440;

  // Handle minute-based intervals
  if (desiredInterval <= maxMinuteInterval) {
    const interval = Math.max(Math.floor(desiredInterval), minInterval);
    return `*/${interval} * * * ? *`;
  }
  
  // Convert to hourly intervals
  const hours = Math.floor(desiredInterval / 60);
  return `0 */${Math.max(hours, 1)} * * ? *`;
}

/**
 * Calculates daily email limit based on warmup phase progression.
 * @example
 * // During initial warmup (day 2) → returns random between 10-15
 * calculateEmailVolume(2) // → 12
 * // During ramp-up phase (day 25) → returns 80
 * calculateEmailVolume(25) // → 80
 * @param {number} daysElapsed - Days since warmup started (0 = first day)
 * @returns {number} Recommended emails per day (capped at 80)
 */
function calculateEmailVolume(daysElapsed) {
  // Define warmup phases with day limits and email ranges.
  const phases = [
    { maxDays: 3, min: 10, max: 15 },    // Phase 1: Days 0-3 (random 10-15 emails/day)
    { maxDays: 7, min: 20, max: 30 },     // Phase 2: Days 4-7 (random 20-30 emails/day)
    { maxDays: 13, min: 30, max: 50 },    // Phase 3: Days 8-13 (random 30-50 emails/day)
    { maxDays: 21, min: 50, max: 80 },    // Phase 4: Days 14-21 (random 50-80 emails/day)
    { maxDays: 29, min: 70, max: 80 },    // Phase 5: Days 22-29 (random 70-80 emails/day)
    { maxDays: Infinity, min: 80, max: 80 } // Phase 6: Day 30+ (fixed at 80)
  ];

  // Identify current phase based on elapsed days - daysElapsed is 5 (Phase 1: 5 <= 3 is false) Phase 2: 5 <= 7 is true so it returns Phase 2
  const phase = phases.find(p => daysElapsed <= p.maxDays) // returns the first matching Phase
  
  // Phase 2: Random value between 20 and 30 - (managed by deepSeek AI)
  return Math.min(Math.floor(Math.random() * (phase.max - phase.min + 1)) + phase.min, 80);
}


/**
 * Determines if schedule needs update and next warmup state
 * @example
 * // After 30 days with enabled state:
 * checkScheduleUpdate(currentCron, 30, 2, 'enabled', warmupConfig)
 * // returns { needsUpdate: true, newCron: '*\/12 * * * ? *', newEmails: 60, nextState: 'disabling-1/4' }
 * @param {CronParts} currentCron - Current cron schedule
 * @param {number} daysElapsed - Days since warmup started
 * @param {number} recipientCount - Number of email recipients
 * @param {string} currentState - Current warmup state
 * @param {object} warmup - Current warmup config
 * @returns {ScheduleUpdate}
 */
function checkScheduleUpdate(currentCron, daysElapsed, recipientCount, currentState, warmup) {
  const baseVolume = capEmailVolume(calculateEmailVolume(daysElapsed));
  
  let nextState = null;
  if (daysElapsed >= WARMUP_DURATION_DAYS) {
    const daysInState = moment.utc().diff(moment.utc(warmup.updated_at), 'days');
    nextState = getNextDisableState(currentState, daysInState);
  }

  const newCron = generateCronExpression(baseVolume, recipientCount);
  
  return {
    needsUpdate: JSON.stringify(currentCron) !== JSON.stringify(parseCronExpression(newCron)) || !!nextState,
    newCron,
    newEmails: baseVolume,
    nextState
  }
}


/**
 * Scales sending volume based on warmup state.
 * 
 * @example
 * // When disabling to 75% capacity:
 * const result = scaleVolume('disabling-1/4', { emailsPerDay: 100 }, 'Europe/Paris');
 * // returns { emailsPerDay: 75, cronParts: '*\19 /* * * *' }
 * 
 * @param {string} warmupState - Current warmup state.
 * @param {WarmupConfig} warmup - Current warmup config.
 * @param {string} timezone - User timezone.
 * @returns {WarmupConfig} Updated warmup config.
 */
function scaleVolume(warmupState, warmup, timezone) {
  const stage = DISABLE_STAGES.find(s => s.phase === warmupState) || { factor: 1 }
  const base = warmup.emailsPerDay || MAX_DAILY_EMAILS;
  const newEmails = capEmailVolume(Math.floor(base * stage.factor));

  return {
    ...warmup,
    emailsPerDay: newEmails,
    cronParts: parseCronExpression(generateCronExpression(newEmails, warmup.sendEmailsTo?.length)),
    updated_at: moment().tz(timezone).toISOString()
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
 */
export async function updateSchedule(
  redis,
  scheduler,
  createdAt,
  scheduleName,
  warmupState,
  recipientCount,
  cronParts,
  timezone
) {
  // 1) load, find our warmup entry
  const warmups = JSON.parse(await redis.get('warmups') || '[]');
  let warmup = warmups.find(w => w.domain === scheduleName.replace('warmup-', ''));
  if (!warmup) return;

  // 2) days since start
  const daysElapsed = moment().tz(timezone).diff(createdAt, 'days');

  // 3) enabling phases: immediate scale
  if (warmupState.startsWith('enabling')) {
    const updated = scaleVolume(warmupState, warmup, timezone);
    // override locals so checkScheduleUpdate sees the fresh cronParts
    warmup = updated;
    cronParts = updated.cronParts;

    // persist
    const newList = warmups.map(w => w.domain === warmup.domain ? updated : w);
    await redis.set('warmups', JSON.stringify(newList));
    await updateEventBridgeSchedule(scheduler, scheduleName, updated);
  }

  // 4) see if any further schedule updates needed (covers disabling & first disable transition)
  const check = checkScheduleUpdate(
    cronParts,
    daysElapsed,
    recipientCount,
    warmupState,
    warmup
  );

  // 5) apply if needed
  if (check.needsUpdate) {
    // compute next state / volume
    const nextState = check.nextState;
    const newEmails = check.newEmails;
    const updatedConfig = {
      ...warmup,
      // apply disabling stage factor if we just moved into a disabling phase
      emailsPerDay: nextState
        ? Math.floor(newEmails * (DISABLE_STAGES.find(s => s.phase === nextState)?.factor || 1))
        : newEmails,
      cronParts: parseCronExpression(check.newCron),
      warmupState: nextState || warmup.warmupState,
      updated_at: nextState
        ? moment().tz(timezone).toISOString()
        : warmup.updated_at
    }

    const updatedWarmups = warmups.map(w =>
      w.domain === updatedConfig.domain ? updatedConfig : w
    );
    await redis.set('warmups', JSON.stringify(updatedWarmups));
    await updateEventBridgeSchedule(scheduler, scheduleName, updatedConfig);
  }
}


async function updateEventBridgeSchedule(scheduler, name, config) {
  const existing = await scheduler.send(
    new GetScheduleCommand({ Name: name, GroupName: 'warmup-group' })
  );

  const recipientCount = config.sendEmailsTo?.length || 1;
  
  await scheduler.send(
    new UpdateScheduleCommand({
      Name: name,
      GroupName: 'warmup-group',
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: `cron(${generateCronExpression(config.emailsPerDay, recipientCount)})`,
      ScheduleExpressionTimezone: existing.ScheduleExpressionTimezone,
      Target: {
        ...existing.Target,
        Input: JSON.stringify(config),
        Arn: existing.Target.Arn,
        RoleArn: existing.Target.RoleArn
      }
    })
  );
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







  // ------ 1. Create instances ------ //
  
  // 1.1 [VARIABLE]: Decrypt resned
  const decypredResend = await decryptResend(encryptedResend)
  if (typeof decypredResend === 'string') throw Error(decypredResend,{cause:"decypredResend"})
    
    
    // 1.2 [INSTANCE]: Create Resend SDK instance
    const resend = new Resend(decypredResend.value)
    // 1.3 [INSTANCE]: Create Redis SDK instance
    const redis = new Redis(process.env.UPSTASH_REDIS_URL)
    // 1.4 [INSTANCE]: Create schedulerClient SDK instance (EventBridge)
    const schedulerClient = new SchedulerClient({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
    
    
    
    
    
    
    
    
  // ------ 2. Check do I need to up/down scale volume of warming up ------ //
  const scheduleName = `warmup-${domain}`
  const updScheduleResp = await updateSchedule(redis, schedulerClient, created_at, scheduleName, warmupState, sendEmailsTo, cronParts, userTimezone)
  if (typeof updScheduleResp === 'string') throw Error(`Error on line 613: ${updScheduleResp}`,{cause:"updScheduleResp"})
    
    
    
 
    
  // ------ 3. Send warmup email ------ //

  // 3.1.1 [VARIABLE]: Decrypt resned
  const currentTime = moment().tz(userTimezone);
  const checkEmailTemplate = await getRandomEmail(niche);
  const checkEmailTime = {
    startTime: currentTime.clone().startOf("day").add(9, "hours").add(59, "minutes"),
    endTime: currentTime.clone().startOf("day").add(11, "hours"),
  }
  const formattedTodayDate = `${moment().tz(userTimezone).format('DD.MM.YYYY [at] HH:mm')} ${userTimezone}`

  
  // 3.1.2 Send checkEmail - during allowed time window (9:59 - 11:00 userTimezone)
  if (currentTime.isBetween(checkEmailTime.startTime, checkEmailTime.endTime)) {
    const sendStats = Math.random() < 0.2; // send stats with 20% chance
    const emailBody = sendStats
    ? renderEmailStats(domain, created_at, userTimezone, niche, cronParts, warmupState)
    : renderedEmailWarmup(checkEmailTemplate.body);
    
    const response = await sendEmail(
      resend,
      emailFrom,
      checkEmail,
      sendStats ? `stats for ${emailFrom} in ${niche} ${formattedTodayDate}` : checkEmailTemplate.subject,
      emailBody
    );
    if (typeof response === 'string') throw Error(`error on line 638: ${response}`, { cause: sendStats ? "sendEmailStatsResp" : "sendEmailResp" });
  }
  
  
  
  
  // 3.2 Send warmup email  
  let sendError = null;
  for (let i = 0; i < sendEmailsTo.length; i++) {
    const recipientEmail = await getRandomEmail(niche);
    const sendEmailResp = await sendEmail(
      resend,
      emailFrom,
      sendEmailsTo[i],
      recipientEmail.subject,
      renderedEmailWarmup(recipientEmail.body)
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
