import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    azure: {
      hasClientId: !!process.env["AZURE_AD_CLIENT_ID"],
      hasTenantId: !!process.env["AZURE_AD_TENANT_ID"],
      hasClientSecret: !!process.env["AZURE_AD_CLIENT_SECRET"],
    },
    sharepoint: {
      hasSiteId: !!process.env["SHAREPOINT_SITE_ID"],
    },
    auth: {
      hasNextAuthUrl: !!process.env["NEXTAUTH_URL"],
      hasNextAuthSecret: !!process.env["NEXTAUTH_SECRET"],
    },
  });
}
