declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      AZURE_AD_CLIENT_ID: string;
      AZURE_AD_CLIENT_SECRET: string;
      DATABASE_URL: string;
    }
  }
}

export {};
