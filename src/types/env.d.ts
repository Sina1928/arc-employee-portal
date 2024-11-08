declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    AZURE_AD_CLIENT_ID: string;
    AZURE_AD_CLIENT_SECRET: string;
    AZURE_AD_TENANT_ID: string;
    DATABASE_URL: string;
  }
}
