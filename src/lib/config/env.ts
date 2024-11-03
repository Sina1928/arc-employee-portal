export const env = {
  microsoft: {
    tenantId: process.env["AZURE_AD_TENANT_ID"] || "",
    clientId: process.env["AZURE_AD_CLIENT_ID"] || "",
    clientSecret: process.env["AZURE_AD_CLIENT_SECRET"] || "",
    sharepointSiteId: process.env["SHAREPOINT_SITE_ID"] || "",
  },
  quickbooks: {
    clientId: process.env["QUICKBOOKS_CLIENT_ID"] || "",
    clientSecret: process.env["QUICKBOOKS_CLIENT_SECRET"] || "",
    environment: (process.env["QUICKBOOKS_ENVIRONMENT"] || "sandbox") as
      | "sandbox"
      | "production",
    redirectUri: process.env["QUICKBOOKS_REDIRECT_URI"] || "",
  },
} as const;
