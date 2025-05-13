export const niches = ["roofing", "autodetailing", "job apps"] as const
export type Niche = (typeof niches)[number]

export type CronParts = {
  minutes: string
  hours: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  year: string
}

export type TWarmupState = 
     "enabled"
    | "enabling-1/4"
    | "enabling-2/4"
    | "enabling-3/4"
    | "disabled"
    | "disabling-1/4"
    | "disabling-2/4"
    | "disabling-3/4" // explanation - https://i.imgur.com/WwEXEPE.png - https://i.imgur.com/Ex0SVqc.png


// to reduce complexity - it shouldn't match EB
export interface IWarmUp {
  id: string // 32 symbols
  created_at: string // ISO
  updated_at: string // ISO
  warmupCompletion: "completed" | "forcibly disabled" | "not completed"
  warmupState:TWarmupState
  domain: string // to find domain that need to be updated
  emailFrom: string // if user wants to change from nicitaacom@domain.com to support@domain.com
  niche: Niche
  sendEmailsTo: string[]
  checkEmail: string
  cronParts: CronParts
  emailsPerDay: number // required because min 2 emails so if I need 50 emails/day then cron parts should be 24 times per day
  userTimezone: string
}
