"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const ioredis_1 = require("ioredis");
const openai_1 = __importDefault(require("openai"));
const supabase_js_1 = require("@supabase/supabase-js");
const client_scheduler_1 = require("@aws-sdk/client-scheduler");
const Warmup_1 = require("./src/classes/Warmup");
const client_ses_1 = require("@aws-sdk/client-ses");
// DEPENDS ON: outreach-tool RedisKey
// entitryRedis
const getLambdaDomainRecordKey = () => `lambdaDomainRecord`;
const getUserRedisUrlKey = (userId) => `userRedisUrl-${userId}`;
// userRedis
const getLambdaEnvsRecordKey = (lambdaFnName) => `lambdaEnvs-${lambdaFnName}`;
const handler = async (event) => {
    // created_at - it's ISO - to detect how much days smb warming up and to scale from 10 to 20 ... to 100 emails per day 
    // warmupState - e.g "enabling-1/4" or "disabled" or "disabling-3/4" - explanation - https://i.imgur.com/WwEXEPE.png - https://i.imgur.com/Ex0SVqc.png
    // domain - to select schedule name to update warmup in EventBridge because - https://i.imgur.com/eD4ssVz.png
    // emailFrom - for SES so I send emails from email that needs to be warmed up
    // niche - to send more realistic warmup emails
    // sendEmailsTo - to send warmup emails to someone (e.g myself) - note that this is array
    // checkEmail - to check if I'm in SPAM box or not (DO NOT user "Not spam" button on checkEmail)
    // cronParts - to update them for `warmup-${domain}` in EB event to show later on UI on OT AND to check should update EB or not
    // userTimezone - to send check email within timezone e.g 10:00 - so user understand whether CE on SPAM or not
    const { warmupId } = event;
    // WARNING! - event - DEPENDS ON Warmup (class) outreach-tool
    // --- Validate entity redis url --- //
    if (!process.env.ENTITY_UPSTASH_REDIS_URL) {
        throw Error("No ENTITY_UPSTASH_REDIS_URL provided - make sure you provided that in Lambda -> Configuration -> Environment variables");
    }
    if (!process.env.DOMAIN) {
        throw Error("No DOMAIN provided - You may provide here any domain you (entity) own - just make sure that it's no domain of your client");
    }
    if (!process.env.ENTITY_UPSTASH_REDIS_URL.includes("rediss://"))
        throw Error("Redis must be as secured connection - make sure you have rediss:// at start of your ENTITY_UPSTASH_REDIS_URL");
    // 🔍 Step 1: Validate structure
    const isValidFormat = /^rediss:\/\/.+:\d{4}$/.test(process.env.ENTITY_UPSTASH_REDIS_URL)
        && process.env.ENTITY_UPSTASH_REDIS_URL.length > 50
        && process.env.ENTITY_UPSTASH_REDIS_URL.length < 300;
    if (!isValidFormat)
        return "Invalid UPSTASH_REDIS_URL format – check rediss://...:port";
    const entityRedis = new ioredis_1.Redis(process.env.ENTITY_UPSTASH_REDIS_URL);
    // 1. ENTITY_UPSTASH_REDIS_URL and ntfcnGroup is the only envs that must stay in process.env in lambda envs - everything else comes from Redis
    const lambdaDomainRecordKey = getLambdaDomainRecordKey();
    const userId = await entityRedis.hget(lambdaDomainRecordKey, process.env.DOMAIN);
    if (!userId) {
        return { errorMessage: `No userId found for domain: ${process.env.DOMAIN}`, status: 400 };
    }
    const userRedisUrlKey = getUserRedisUrlKey(userId);
    const userRedisUrl = await entityRedis.get(userRedisUrlKey);
    if (!userRedisUrl) {
        return { errorMessage: `No userRedisUrl found: make sure that you completed lambda setup screen and set entitry redis url via sudo su`, status: 400 };
    }
    // 1.1 [INSTANCE]: Create userRedis instance
    const userRedis = new ioredis_1.Redis(userRedisUrl);
    // 2. fetch all envs stored by LambdaSetupScreen
    const lambdaEnvsRecordKey = getLambdaEnvsRecordKey("warmup");
    const storedEnvs = await userRedis.hgetall(lambdaEnvsRecordKey);
    if (!storedEnvs || !Object.keys(storedEnvs).length)
        throw Error("Lambda envs not configured - complete lambda envs setup in outreach-tool");
    // 3. merge with process.env so existing helpers that read process.env still work
    Object.entries(storedEnvs).forEach(([key, value]) => { process.env[key] = value; });
    try {
        // --- IN TRY CATCH: Validate envs and variables from event --- //
        const requiredFields = [
            { key: warmupId, name: "warmupId" },
            { key: process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL, name: "NEXT_PUBLIC_PRODUCTION_AUTH_URL", env: true },
            { key: process.env.NEXT_PUBLIC_PRODUCTION_URL, name: "NEXT_PUBLIC_PRODUCTION_URL", env: true },
            { key: process.env.NEXT_PUBLIC_SUPABASE_URL, name: "NEXT_PUBLIC_SUPABASE_URL", env: true },
            { key: process.env.SUPABASE_SERVICE_ROLE_KEY, name: "SUPABASE_SERVICE_ROLE_KEY", env: true },
            { key: process.env.LINK, name: "LINK", env: true },
            { key: process.env.OWNER_NAME, name: "OWNER_NAME", env: true },
            { key: process.env.COMPANY_NAME, name: "COMPANY_NAME", env: true },
            { key: process.env.ACCESS_KEY_ID, name: "ACCESS_KEY_ID", env: true },
            { key: process.env.SECRET_ACCESS_KEY, name: "SECRET_ACCESS_KEY", env: true },
            { key: process.env.REGION, name: "REGION", env: true },
            { key: process.env.WARMUP_KEY, name: "WARMUP_KEY", env: true },
            { key: process.env.OPENAI_KEY, name: "OPENAI_KEY", env: true },
        ];
        const ctaEnvs = `Check your envs in AWS Lambda warmup -> Configuration -> Environment variables`;
        const ctaEvent = `Check your event in AWS -> EventBridge -> warmup-yourdomain.com -> Target (contact support)`;
        for (const { key, name, env } of requiredFields) {
            if (!key) {
                const cta = env ? ctaEnvs : ctaEvent;
                const errorMsg = `${name} missing - ${cta}`;
                console.log(124, errorMsg);
                throw Error(errorMsg);
            }
        }
        if (!process.env.LINK.startsWith("https"))
            throw Error("should be https://your-appointment-booking.link (make sure it's https)");
        // ------ 1. Create instances + variables ------ //
        // 1.1 [INSTANCE]: Create Redis SDK instance
        const redis = new ioredis_1.Redis(process.env.UPSTASH_REDIS_URL);
        // 1.2 [VARIABLE]: Get warmup to update
        const warmups = JSON.parse(await redis.get('warmups') || '[]');
        let warmupToUpdate = warmups.find(w => w.id === warmupId);
        if (!warmupToUpdate)
            throw Error("It's no warmup to update", { cause: "warmup" });
        // 1.3 [INSTANCE]: Initialize schedulerClient SDK instance (EventBridge)
        const schedulerClient = new client_scheduler_1.SchedulerClient({
            region: process.env.REGION,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY,
            },
        });
        // 1.4 [INSTANCE]: Initialize schedulerClient SDK instance (EventBridge)
        const sesClient = new client_ses_1.SESClient({
            region: process.env.NEXT_PUBLIC_AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        // 1.5 [INSTANCE]: Initialize OpenAI SDK instance
        const openai = new openai_1.default({ apiKey: process.env.OPENAI_KEY });
        // 1.6 [INSTANCE]: Initialize Supabase SDK instance
        const supabaseAdmin = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const warmup = new Warmup_1.Warmup(schedulerClient, redis, sesClient, openai, supabaseAdmin);
        // ------ 2. 20% && AI reply------ //
        const updScheduleResp = await warmup.updateSchedule(warmups, warmupToUpdate);
        if (typeof updScheduleResp === 'string')
            throw Error(`Error on line 117: ${updScheduleResp}`, { cause: "updScheduleResp" });
        // ------ 3. Send warmup email ------ //
        // 3.1 Get all BS to don't spam with lines of code (my style)
        const { isCurrTimeBetween, isSendToCheckEmail, statsEmail, isAIReply, warmupEmail } = await warmup.getAllBS(warmupToUpdate);
        if (isAIReply) {
            const replyWithAIResp = await warmup.replyToWarumEmailWithAI(warmupToUpdate);
            if (typeof replyWithAIResp === 'string')
                throw Error(`Error on line 129: ${replyWithAIResp}`, { cause: "replyWithAIResp" });
        }
        if (isSendToCheckEmail && isCurrTimeBetween) {
            const sesResp = await warmup.sendEmailWithSES(statsEmail);
            if (typeof sesResp === 'string')
                throw Error(`Error on sending stats email: ${sesResp}\n line134`, { cause: "isSendToCheckEmail && isCurrTimeBetween" });
        }
        else if (isSendToCheckEmail) {
            const sesResp = await warmup.sendEmailWithSES(warmupEmail(warmupToUpdate.checkEmail));
            if (typeof sesResp === 'string')
                throw Error(`Error sending stats email: ${sesResp}\n line138`, { cause: "isSendToCheckEmail" });
        }
        else {
            for (const emailTo of warmupToUpdate.sendEmailsTo) {
                const response = await warmup.sendEmailAndInsertInDB("warmup", warmupEmail(emailTo));
                if (typeof response === 'string')
                    throw Error(`Error sending email and inserting it in DB: ${response}`, { cause: "sendEmailAndInsertInDB" });
            }
        }
        return {
            statusCode: 200,
            body: `${(isSendToCheckEmail && isCurrTimeBetween) ? "stats" : isSendToCheckEmail ? "check-warmup" : "warmup"} email sent to:\n
      ${isSendToCheckEmail ? warmupToUpdate.checkEmail : warmupToUpdate.sendEmailsTo.map(email => email).join(', ')}`,
            line1: "Note: DO NOT click \"Not spam\" in ${warmupToUpdate.checkEmail}",
            line2: "For deliverability: DKIM SPF MX TXT (dmarc) MAIL FROM .com or .de or .co.uk etc domain and prefferably to send B2B emails e.g info@custom.domain"
        };
    }
    catch (error) {
        const cleanErrorMessage = error.message
            .replace(/\\n/g, "\n") // Replace \\n with newline character
            .replace(/\\/g, '') // Remove backslashes
            .trim(); // Remove leading and trailing whitespace
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: `Failed to send warmup email - ${cleanErrorMessage}${error.cause ? `(${error.cause})` : ""}`,
            })
        };
    }
};
exports.handler = handler;
