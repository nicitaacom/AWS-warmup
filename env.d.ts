declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRODUCTION_AUTH_URL: string
      NEXT_PUBLIC_PRODUCTION_URL: string

      LINK: string
      OWNER_NAME: string
      COMPANY_NAME: string

      REGION: string
      ACCESS_KEY_ID: string
      SECRET_ACCESS_KEY: string

      UPSTASH_REDIS_URL: string
      
      WARMUP_KEY: string
      OPENAI_KEY: string
      
      NEXT_PUBLIC_SUPABASE_URL: string
      SUPABASE_SERVICE_ROLE_KEY: string

      NEXT_PUBLIC_AWS_REGION:string
      AWS_ACCESS_KEY_ID:string
      AWS_SECRET_ACCESS_KEY:string
      
   
    }
  }
}

export {}
