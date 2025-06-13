import { Resend } from "resend"
import { Redis } from "ioredis"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

import { SchedulerClient } from "@aws-sdk/client-scheduler";

import { decryptResend } from './src/utils/decryptResend';
import { IWarmUp } from './src/interfaces/IWarmUp';
import { Warmup } from './src/classes/Warmup';


export const handler = async (event:{warmupId:string}) => {
  // created_at - it's ISO - to detect how much days smb warming up and to scale from 10 to 20 ... to 100 emails per day 
  // warmupState - e.g "enabling-1/4" or "disabled" or "disabling-3/4" - explanation - https://i.imgur.com/WwEXEPE.png - https://i.imgur.com/Ex0SVqc.png
  // domain - to select schedule name to update warmup in EventBridge because - https://i.imgur.com/eD4ssVz.png
  // emailFrom - for resend so I send emails from email that needs to be warmed up
  // niche - to send more realistic warmup emails
  // sendEmailsTo - to send warmup emails to someone (e.g myself) - note that this is array
  // checkEmail - to check if I'm in SPAM box or not (DO NOT user "Not spam" button on checkEmail)
  // cronParts - to update them for `warmup-${domain}` in EB event to show later on UI on OT AND to check should update EB or not
  // encryptedResend - so I can initialize resend SDK to send warm up emails (ChatGPT recommends 50-100 per day so consider resend limits)
  // userTimezone - to send check email within timezone e.g 10:00 - so user understand whether CE on SPAM or not
  
  const { warmupId } = event;
  // WARNING! - event - DEPENDS ON Warmup (class) outreach-tool



   try { 
  // --- IN TRY CATCH: Validate envs and variables from event --- //

  const requiredFields = [
    { key: warmupId, name: "userTimezone" },
    { key: process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL, name: "NEXT_PUBLIC_PRODUCTION_AUTH_URL", env: true },
    { key: process.env.NEXT_PUBLIC_PRODUCTION_URL, name: "NEXT_PUBLIC_PRODUCTION_URL", env: true },
    { key: process.env.NEXT_PUBLIC_SUPABASE_URL, name: "NEXT_PUBLIC_PRODUCTION_URL", env: true },
    { key: process.env.SUPABASE_SERVICE_ROLE_KEY, name: "NEXT_PUBLIC_PRODUCTION_URL", env: true },
    { key: process.env.LINK, name: "LINK", env: true },
    { key: process.env.OWNER_NAME, name: "OWNER_NAME", env: true },
    { key: process.env.COMPANY_NAME, name: "COMPANY_NAME", env: true },
    { key: process.env.REGION, name: "REGION", env: true },
    { key: process.env.ACCESS_KEY_ID, name: "ACCESS_KEY_ID", env: true },
    { key: process.env.SECRET_ACCESS_KEY, name: "SECRET_ACCESS_KEY", env: true },
    { key: process.env.UPSTASH_REDIS_URL, name: "UPSTASH_REDIS_URL", env: true },
    { key: process.env.WARMUP_KEY, name: "WARMUP_KEY", env: true },
    { key: process.env.OPENAI_KEY, name: "OPENAI_KEY", env: true },
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


    
    // ------ 1. Create instances + variables ------ //


  // 1.1 [INSTANCE]: Create Redis SDK instance
  const redis = new Redis(process.env.UPSTASH_REDIS_URL)
  
  // 1.2 [VARIABLE]: Get warmup to update
  const warmups:IWarmUp[] = JSON.parse(await redis.get('warmups') || '[]');
  let warmupToUpdate = warmups.find(w => w.id === warmupId)
  if (!warmupToUpdate) throw Error("It's no warmup to update",{cause:"warmup"})
      
  // 1.3 [VARIABLE]: Decrypt resned
  const key = `encryptedResend-lambda-${warmupToUpdate.domain}`
  const encryptedResend = await redis.get(key)
  if (!encryptedResend) throw Error(`It's no encryptedResend returned from redis: ${key}`,{cause:"encryptedResend"})
  const decypredResend = await decryptResend(encryptedResend)
  if (typeof decypredResend === 'string') throw Error(decypredResend,{cause:"decypredResend"})
  
  // 1.4 [INSTANCE]: Initialize Resend SDK instance
  const resend = new Resend(decypredResend.value)

  // 1.5 [INSTANCE]: Initialize schedulerClient SDK instance (EventBridge)
  const schedulerClient = new SchedulerClient({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
    
  // 1.6 [INSTANCE]: Initialize OpenAI SDK instance
  const openai = new OpenAI({apiKey: process.env.OPENAI_KEY})
  
  
  // 1.7 [INSTANCE]: Initialize Supabase SDK instance
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  const warmup = new Warmup(schedulerClient,redis,openai,supabaseAdmin)


   



  // ------ 2. 20% ? AI reply : send warumup email (+manage up/down scale volume) ------ //
  const isAIReply = Math.random() < 0.2;
  // const isAIReply = true
  if (isAIReply) {
    const replyWithAIResp = await warmup.replyToWarumEmailWithAI(warmupToUpdate)
    if (typeof replyWithAIResp === 'string') throw Error(`Error on line 118: ${replyWithAIResp}`,{cause:"replyWithAIResp"})
  }
  else {
    const updScheduleResp = await warmup.updateSchedule(warmups, warmupToUpdate)
    if (typeof updScheduleResp === 'string') throw Error(`Error on line 122: ${updScheduleResp}`,{cause:"updScheduleResp"})
  } 




   // ------ 3. Send warmup email ------ //
   // 3.1 Get all BS to don't spam with lines of code (my style)
   const {isCurrTimeBetween,isSendToCheckEmail,statsEmail,warmupEmail} = await warmup.getAllBS(warmupToUpdate)

   if (isSendToCheckEmail && isCurrTimeBetween) {
    const { error } = await resend.emails.send(statsEmail);
    if (error) throw Error(`Error sending stats email: ${error.message}`)
   }
   else if (isSendToCheckEmail) {
    const { error } = await resend.emails.send(warmupEmail(warmupToUpdate.checkEmail));
    if (error) throw Error(`Error sending stats email: ${error.message}`)
   }
   else {
    for (const emailTo of warmupToUpdate.sendEmailsTo) {
      await warmup.sendEmailAndInsertInDB(resend,"warmup",warmupEmail(emailTo))
    }
   } 
   

  return {
    statusCode: 200,
    body: `${(isSendToCheckEmail && isCurrTimeBetween) ? "stats" : isSendToCheckEmail ? "check-warmup" : "warmup"} email sent to:\n
      ${isSendToCheckEmail ? warmupToUpdate.checkEmail : warmupToUpdate.sendEmailsTo.map(email => email).join(', ')}\n\n
      
    Note: DO NOT click "Not spam" in ${warmupToUpdate.checkEmail}\n
    For deliverability: DKIM SPF MX TXT (dmarc) MAIL FROM .com or .de or .co.uk etc domain and prefferably to send B2B emails e.g info@custom.domain`
  }
}
catch (error:any) {
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
}
