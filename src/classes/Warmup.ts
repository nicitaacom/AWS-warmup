import { SupabaseClient } from "@supabase/supabase-js"
import Redis from "ioredis"
import { GetScheduleCommand, SchedulerClient, UpdateScheduleCommand } from "@aws-sdk/client-scheduler"
import OpenAI from "openai"
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import moment from "moment-timezone"
import { Resend } from "resend"
import { join } from "path"



import { CronParts, IWarmUp, Niche, TWarmupState } from '../interfaces/IWarmUp'
import { freeEmailDomains } from '../const/freeEmailDomains'
import { extractEmailFromNameEmail } from '../utils/extractEmailFromNameEmail'
import { extractNameFromNameEmail } from '../utils/extractNameFromNameEmail'
import { decryptResend } from "../utils/decryptResend"
import { WARMUP_DURATION_DAYS,DISABLING_STAGES,ENABLING_STAGES } from "../const/WARMUP_CONFIG"
import { randomNames } from "../const/randomNames"
import { randomMemes } from "../const/randomMemes"


// this setup assuming that user enable warmup just 1 time and will not enable it in the future (cuz it make no sence)
export class Warmup {

  constructor(
    private scheduler: SchedulerClient,
    private redis: Redis,
    private openai:OpenAI,
    protected supabaseAdmin:SupabaseClient<any, "public", any>
  ) {}

  public async replyToWarumEmailWithAI(warmupToUpdate:IWarmUp): Promise<void | string> {
    // 1. selectDBWarmupEmails (string[] | string)
   const sentEmailsResp = await this.selectDBSentEmails(warmupToUpdate.domain)
   if (typeof sentEmailsResp === 'string') return `Error selecting warmup emails from DB: ${sentEmailsResp}`

    // 2. 🌀 Pick a random email
    const randomIndex = Math.floor(Math.random() * sentEmailsResp.length)
    const randomBodyText = sentEmailsResp[randomIndex].body_text ?? null // taken from same randomIndex so it belongs to 1 random email
    const randomSubject = sentEmailsResp[randomIndex].subject ?? null // taken from same randomIndex so it belongs to 1 random email
    const randomRecipientEmail = sentEmailsResp[randomIndex].recipient_email ?? null
    const randomSenderNameEmail = sentEmailsResp[randomIndex].sender_name_email ?? null
    const randomTimestamp = sentEmailsResp[randomIndex].created_at ?? null
    
     // Set role for ChatGPT and for user
    let messages:ChatCompletionMessageParam[] = [
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
    ]

  
   const openAIResp = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // input $0.15/M  | oputout $0.60/M
      messages,
    })

    const aiResponseMsg = openAIResp.choices[0].message.content
    if (!aiResponseMsg) return "No response - check 64"

          // then it's sent to not free domain - probably to some other EA (if so - use AI to reply)
      const recipientDomain = randomRecipientEmail.split("@")[1]
      const html = this.renderSIE(aiResponseMsg, {
          timestamp:randomTimestamp,
          name:extractNameFromNameEmail(randomSenderNameEmail),
          from:extractEmailFromNameEmail(randomSenderNameEmail),
          body:randomBodyText
        })


      if (!freeEmailDomains.includes(recipientDomain)) {
        const encryptedResend = await this.redis.get(`encryptedResend-lambda-${recipientDomain}`)
        if (!encryptedResend) return // then seems like sent to not existing EA
        const decypredResend = await decryptResend(encryptedResend)
        if (typeof decypredResend === 'string') return decypredResend
        
        // [INSTANCE]: Create Resend SDK instance
        const resend = new Resend(decypredResend.value)
        
        const sentResp = await this.sendEmailAndInsertInDB(
          resend,
          'info', // reply from info@domain.name
          {
            from:randomRecipientEmail, // reply with AI from recipient email adress
            subject:randomSubject,
            to:warmupToUpdate.emailFrom, // reply to email adress I sent that email from
            html:html,
          }
        )
        if (typeof sentResp === 'string') return sentResp
      }
      // it's some free domain - reply with AI from gmail
      else {
        const ept = await this.redis.get('ept')
        const eprt = await this.redis.get('eprt')
        if (ept && eprt) {
          await this.sendGmail(ept,eprt,`"from" ${randomRecipientEmail}`,extractEmailFromNameEmail(randomSenderNameEmail),randomSubject,html)
        }
        else return `it's no ept and/or eprt`
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
 async updateSchedule(warmups:IWarmUp[],warmupToUpdate:IWarmUp) {
  // 1. Perform methods based on days elapsed (since created_at)
  const daysSinceCreated = moment().tz(warmupToUpdate.userTimezone).diff(warmupToUpdate.created_at, 'days')

  // 2. First things first - check if I need to change warmup state
  const prevWarmupState = warmupToUpdate.warmupState
  warmupToUpdate.warmupState = this.handleUpdateState(warmupToUpdate)

  if (prevWarmupState !== warmupToUpdate.warmupState) this.handleVolumeScale(warmupToUpdate)

  // 3. Detect anomany in warmupCompletion (e.g if disabled manually by user from EB)
  warmupToUpdate.warmupCompletion = this.detectForcedDisable(warmupToUpdate)

  // 4. Update reids&EB
  const updatedWarmups = warmups.map(w => w.id === warmupToUpdate.id ? warmupToUpdate : w)
  await this.redis.set('warmups', JSON.stringify(updatedWarmups));
  await this.updateEventBridgeSchedule(`warmup-${warmupToUpdate.domain}`, warmupToUpdate);
}



private renderEmailStats(warmup:IWarmUp) {
  const daysDifference = moment().tz(warmup.userTimezone).diff(moment(warmup.created_at).tz(warmup.userTimezone),"days")
  const bgColorClass = this.getBgColorClass(warmup.warmupState);
  const {domain,created_at,userTimezone,cronParts,niche,warmupState} = warmup

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
private renderWarmupEmail(body:string) {
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



public async getAllBS(warmup:IWarmUp) {
  const currentTime = moment().tz(warmup.userTimezone);
  const randomWarmupEmail = await this.getRandomEmail(warmup.niche);

  const checkEmailTime = {
    startTime: currentTime.clone().startOf("day").add(9, "hours").add(59, "minutes"),
    endTime: currentTime.clone().startOf("day").add(11, "hours"),
  }
  const formattedTodayDate = `${moment().tz(warmup.userTimezone).format('DD.MM.YYYY [at] HH:mm')} ${warmup.userTimezone}`
  const isCurrTimeBetween = currentTime.isBetween(checkEmailTime.startTime, checkEmailTime.endTime)
  const isSendToCheckEmail = Math.random() < 0.2;

  const statsEmail = {
    from:`"warmup stats" <info@${warmup.domain}>`,
    to: warmup.checkEmail ,
    subject: `stats for ${warmup.emailFrom} in ${warmup.niche} ${formattedTodayDate}`,
    html: this.renderEmailStats(warmup)
  }
  const warmupEmail = (emailTo:string) => {
    return {
      from:`"warmup" <warmup@${warmup.domain}>`,
      to: emailTo,
      subject: randomWarmupEmail.subject,
      html: this.renderWarmupEmail(randomWarmupEmail.body)
    }
  }

  return {isCurrTimeBetween, isSendToCheckEmail, statsEmail, warmupEmail}
}



private handleVolumeScale(warmupToUpdate:IWarmUp):IWarmUp {
  const stageFactor = [...ENABLING_STAGES, ...DISABLING_STAGES].find(s => s.phase === warmupToUpdate.warmupState)?.factor || 1
  
  // ⚠️ emailsPerDay is always ≥ 2 (up/down scale emails per day)
  const scaledEmailsPerDay = Math.max(2, Math.round(warmupToUpdate.emailsPerDay * stageFactor))
  
  // Create new cron expression based on scaled email volume
  const { cronParts, cronString } = this.generateCronExpression(scaledEmailsPerDay, warmupToUpdate.sendEmailsTo?.length || 1);

  return {
    ...warmupToUpdate,
    updated_at: moment().tz(warmupToUpdate.userTimezone).toISOString(),
    emailsPerDay: scaledEmailsPerDay,
    cronParts: cronParts,
  }
}

private async selectDBSentEmails(domain:string) {
    const foldersTable = `email-folders-${domain}`
    const emailsTable = `emails-${domain}`

    // 1️⃣ Get email IDs for the given folder
    const { data: folderRows, error: folderError } = await this.supabaseAdmin
      .from(foldersTable)
      .select("email_id")
      .eq("folder_name", 'sent')

    if (folderError) return `Error fetching folder 'sent' emails - ${folderError.message}`

  
    const emailIds = folderRows?.map(row => row.email_id) ?? []
    if (!emailIds.length) return []

    // 2️⃣ Fetch emails using those IDs
    const { data: emails, error: emailError } = await this.supabaseAdmin
      .from(emailsTable)
      .select('body_text,subject,recipient_email,created_at,sender_name_email')
      .in("id", emailIds)
      .ilike('sender_name_email', '%warmup%') // select sent warum emails only
      .order("updated_at", { ascending: false }) // from new to old
      .limit(10)

    if (emailError) return `Error selecting emails sent warmup emails from '${emailsTable}' - ${emailError.message}`
    if (!emails?.length) return []

    return emails
  }

private async sendGmail(ept:string,eprt:string,nameEmailFrom:string,emailTo:string,emailSubject:string,emailHtml:string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL}api/sendGmail`, {
    method: "POST",
      body: JSON.stringify({
        ept: ept,
        eprt: eprt,
        nameEmailFrom: nameEmailFrom,
        emailTo: emailTo,
        emailSubject: emailSubject,
        emailHtml:emailHtml
    }),
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": process.env.NEXT_PUBLIC_PRODUCTION_URL!,
    },
    cache: "no-cache", // Should be no cache to improve security
  })

  if (!response.ok) {
    const errorMessage = await response.text(); // Get the error message from the response body
    return `Error sending gmail ${response.status}: ${errorMessage || "Unknown error"}`
  }
}



private escapeHtml(text:string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
  }

private extractBodyContent(html:string) {
    const match = html.match(/<body[^>]*>((.|[\n\r])*)<\/body>/im)
    return match ? match[1] : html
  }

private renderReplyBlockQuote(
  emailTimestamp:string,
  emailFromName:string,
  email:string,
  emailBody:string,
) {
  const rawBody = this.extractBodyContent(emailBody || "")

  return `
  <div>${this.escapeHtml(emailTimestamp)}, "${this.escapeHtml(emailFromName)}" &lt;${this.escapeHtml(extractEmailFromNameEmail(email))}&gt;:<br /></div>
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
`
}


private renderSIE(
   initialEmailBody:string,
   originalEmail:{
      timestamp: string
      name: string
      from: string
      body: string
   },
) {
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
  `
}





private getBgColorClass = (warmupState:TWarmupState) => {
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



// it's important to pass resend instance here because it might be other resend instance that initialized with different credentials (env)
public async sendEmailAndInsertInDB(resend:Resend,name:string, email: {subject:string, from:string, to:string, html:string}) {
    let insertError = ''
    let sendError = ''

    // DO NOT use this.resend here (because might be sent from other resend instance)
    const {data, error} = await resend.emails.send(email);
    if (error) return error.message

    const cleanBody = this.htmlToCleanText(email.html)
  
    // TODO - check how is that goes if I send from www.nicitaa.com
    const sentEmail = {
      id: data?.id, // returned from resend.send response - https://i.imgur.com/McXYhoN.png
      created_at: new Date().toISOString(),
      subject: email.subject,
      body_html: email.html,
      body_text: cleanBody,
      recipient_email: email.to,
      sender_name_email: `"${name}" <${email.from}>`,
      metric_name: null,
      is_read: true, // emails I sent myself if readed - decided to don't implement is_read_by functionality to keep it simple (I see no reason) 
      attachments_count: 0, // it's no way to add attachment with SES (I tried) that's why I use <a> as attachment
    }

    // 6.1 Insert email record
    const { error: insert_error } = await this.supabaseAdmin
    .from(`emails-${email.from.split("@")[1]}`)
    .insert(sentEmail)
    if (insert_error) insertError = insert_error.message
        


    const { error: insert_email_folders_error } = await this.supabaseAdmin
      .from(`email-folders-${email.from.split("@")[1]}`)
      .insert({
        email_id:sentEmail.id,
        folder_name: "sent"
      })
    if (insert_email_folders_error) insertError = insert_email_folders_error.message

    if (sendError) return sendError
    if (insertError) return insertError
  }


  /**
 * Generates cron expression and parsed parts for EventBridge based on volume & recipient count
 * @param {number} emailsPerDay - Total emails to send per day
 * @param {number} recipientCount - Emails sent per execution
 * @returns {{cronString: string, cronParts: CronParts}} Cron string and parsed parts
 */
private generateCronExpression(emailsPerDay: number, recipientCount = 1): {
  cronString: string
  cronParts: CronParts
} {
  const minInterval = 1
  const maxMinuteInterval = 59

  const validEmails = Math.max(Number(emailsPerDay) || 0, 1)
  const validRecipients = Math.max(Number(recipientCount) || 1, 1)

  const executions = Math.ceil(validEmails / validRecipients)
  const desiredInterval = executions > 0 ? 1440 / executions : 1440

  let cronString = ""
  let minutes = "*"
  let hours = "*"

  if (desiredInterval <= maxMinuteInterval) {
    const interval = Math.max(Math.floor(desiredInterval), minInterval)
    cronString = `*/${interval} * * * ? *`
    minutes = `*/${interval}`
  } else {
    const hourlyInterval = Math.max(Math.floor(desiredInterval / 60), 1)
    cronString = `0 */${hourlyInterval} * * ? *`
    minutes = "0"
    hours = `*/${hourlyInterval}`
  }

  const cronParts: CronParts = {
    minutes,
    hours,
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "?",
    year: "*"
  }

  return { cronString, cronParts }
}

private detectForcedDisable(warmup: IWarmUp): "completed" | "forcibly disabled" | "not completed" {
  if (warmup.warmupState !== "disabled") return warmup.warmupCompletion || "not completed" // if warmup completed it returns warmupCompletion

  const created = moment(warmup.created_at)
  const updated = moment(warmup.updated_at)

  const expectedTotalDays =
    ENABLING_STAGES.reduce((sum, stage) => sum + stage.durationDays, 0) +
    DISABLING_STAGES.reduce((sum, stage) => sum + stage.durationDays, 0)

  const actualDays = updated.diff(created, "days")

  return actualDays >= expectedTotalDays ? "completed" : "forcibly disabled"
}

private handleUpdateState(warmup: IWarmUp): TWarmupState {
  const stages = [...ENABLING_STAGES, ...DISABLING_STAGES]
  let dayCounter = 0

  for (const stage of stages) {
    dayCounter += stage.durationDays
    const daysSinceCreated = moment().tz(warmup.userTimezone).diff(warmup.created_at, 'days')

    if (daysSinceCreated < dayCounter) {
      return stage.phase as TWarmupState
    }
  }

  return 'disabled'
}

private async updateEventBridgeSchedule(scheduleName:string,updatedWarmup:IWarmUp) {
  const existing = await this.scheduler.send(
    new GetScheduleCommand({ Name: scheduleName, GroupName: 'warmup-group' })
  );

  const {cronString} = this.generateCronExpression(updatedWarmup.emailsPerDay, updatedWarmup.sendEmailsTo.length)
  
  await this.scheduler.send(
    new UpdateScheduleCommand({
      Name: scheduleName,
      GroupName: 'warmup-group',
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: `cron(${cronString})`,
      ScheduleExpressionTimezone: existing.ScheduleExpressionTimezone,
      Target: {
        ...existing.Target,
        Input:JSON.stringify( {warmupId:updatedWarmup.id}),
        Arn: existing?.Target?.Arn,
        RoleArn: existing?.Target?.RoleArn
      }
    })
  );
}



private async getRandomEmail(niche:Niche) {
  // keep .js because anyway it's going to be compiles TS to JS so it will use .js
  // const emailTemplates:{subject:string,body:string}[] = await import(`../const/${niche}.js`).then(module => module.default);
  
  const absolutePath = join(__dirname, "..", "const", `${niche}.js`) // ⬅️ real path
  const emailTemplates:{subject:string,body:string}[] = await import(absolutePath).then(m => m.default) // ⬅️ no file://

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


/**
 * Converts HTML to plain text for search functionality
 */
private htmlToCleanText(html:string) {
  if (!html) return ''
  
  // First pass - remove HTML structure and entities
  let clean = html
    .replace(/&nbsp;/g, ' ')          // Convert &nbsp; to normal space
    .replace(/&(amp|lt|gt|quot|#39);/g, ' ') // Common HTML entities
    .replace(/&#\d+;/g, ' ')          // Remove numeric HTML entities (like &#8199;)
    .replace(/<style[^>]*>.*?<\/style>/gis, ' ')  // Remove CSS
    .replace(/<script[^>]*>.*?<\/script>/gis, ' ') // Remove JS
    .replace(/<[^>]+>/g, ' ')         // Strip all HTML tags
    .replace(/\[REMOVED_INLINE_IMAGE\]/g, '')    // Remove placeholder

  // Second pass - clean special characters and whitespace
  return clean
    .replace(/[^\w\s.,!?@#$%^&*()\-+=:;'"<>{}[\]\\/]/g, ' ') // Keep basic punctuation
    .replace(/\s+/g, ' ')             // Collapse all whitespace
    .substring(0, 10000)              // Maintain your length limit
    .trim()
}
}