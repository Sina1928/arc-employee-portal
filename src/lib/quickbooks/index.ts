import OAuthClient from "intuit-oauth";
import { env } from "../config/env";

export interface CreateExpenseParams {
  employeeRef: string;
  amount: number;
  description: string;
  date: Date;
  receiptUrl?: string | null;
}

interface QuickBooksTokenResponse {
  access_token: string;
  refresh_token: string;
  realmId: string;
  expires_in: number;
}

class QuickBooksManager {
  private oauthClient: OAuthClient;

  constructor() {
    this.oauthClient = new OAuthClient({
      clientId: env.quickbooks.clientId,
      clientSecret: env.quickbooks.clientSecret,
      environment: env.quickbooks.environment,
      redirectUri: env.quickbooks.redirectUri,
    });
  }

  async createExpenseEntry(_params: CreateExpenseParams) {
    try {
      // Mock implementation for now
      return {
        Id: `QB-EXP-${Date.now()}`,
      };
    } catch (error) {
      console.error("QuickBooks expense creation error:", error);
      throw new Error("Failed to create expense in QuickBooks");
    }
  }

  async handleCallback(url: string): Promise<QuickBooksTokenResponse> {
    const authResponse = await this.oauthClient.createToken(url);
    const tokenData = authResponse.getJson();

    if (!tokenData.realmId) {
      throw new Error("Missing realmId in QuickBooks response");
    }

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      realmId: tokenData.realmId,
      expires_in: tokenData.expires_in,
    };
  }
}

export const quickBooks = new QuickBooksManager();

// import OAuthClient from "intuit-oauth";
// import { prisma } from "../db/prisma";

// interface QuickBooksExpenseEntry {
//   Id: string;
//   Amount: number;
//   Description: string;
//   Date: string;
//   ReceiptUrl?: string;
// }

// interface CreateExpenseParams {
//   employeeRef: string;
//   amount: number;
//   description: string;
//   date: Date;
//   receiptUrl?: string;
// }

// class QuickBooksManager {
//   private oauthClient: OAuthClient;

//   constructor() {
//     this.oauthClient = new OAuthClient({
//       clientId: process.env.QUICKBOOKS_CLIENT_ID!,
//       clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
//       environment: process.env.QUICKBOOKS_ENVIRONMENT!,
//       redirectUri: process.env.QUICKBOOKS_REDIRECT_URI!,
//     });
//   }

//   getAuthorizationUrl(): string {
//     return this.oauthClient.authorizeUri({
//       scope: [
//         "com.intuit.quickbooks.accounting",
//         "com.intuit.quickbooks.payroll",
//         "openid",
//         "profile",
//         "email",
//       ],
//       state: "randomState",
//     });
//   }

//   async handleCallback(url: string): Promise<{
//     access_token: string;
//     refresh_token: string;
//     realmId: string;
//     expires_in: number;
//   }> {
//     const authResponse = await this.oauthClient.createToken(url);
//     const tokenData = authResponse.getJson();

//     await prisma.quickBooksIntegration.upsert({
//       where: {
//         realmId: tokenData.realmId!,
//       },
//       update: {
//         accessToken: tokenData.access_token,
//         refreshToken: tokenData.refresh_token,
//         tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
//       },
//       create: {
//         realmId: tokenData.realmId!,
//         accessToken: tokenData.access_token,
//         refreshToken: tokenData.refresh_token,
//         tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
//       },
//     });

//     return tokenData;
//   }

//   async createExpenseEntry(
//     data: CreateExpenseParams
//   ): Promise<QuickBooksExpenseEntry> {
//     const integration = await prisma.quickBooksIntegration.findFirst();
//     if (!integration) throw new Error("QuickBooks not connected");

//     // Check if token needs refresh
//     if (integration.tokenExpiresAt < new Date()) {
//       await this.refreshToken(integration.refreshToken);
//     }

//     // Create expense in QuickBooks
//     const response = await this.oauthClient.makeApiCall({
//       url: `https://quickbooks.api.intuit.com/v3/company/${integration.realmId}/purchase`,
//       method: "POST",
//       body: {
//         PaymentType: "Cash",
//         AccountRef: {
//           name: "Expense Account",
//           value: "1", // You'll need to get the actual account ID from QuickBooks
//         },
//         EntityRef: {
//           value: data.employeeRef,
//           type: "Employee",
//         },
//         TotalAmt: data.amount,
//         PrivateNote: data.description,
//         TxnDate: data.date.toISOString().split("T")[0],
//         AttachableRef: data.receiptUrl
//           ? [
//               {
//                 FileName: "Receipt",
//                 AttachableRef: { EntityRef: data.receiptUrl },
//               },
//             ]
//           : undefined,
//       },
//     });

//     return response;
//   }

//   private async refreshToken(refreshToken: string): Promise<void> {
//     const authResponse = await this.oauthClient.refreshUsingToken(refreshToken);
//     const { access_token, refresh_token, expires_in } = authResponse.getJson();

//     await prisma.quickBooksIntegration.updateMany({
//       data: {
//         accessToken: access_token,
//         refreshToken: refresh_token,
//         tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
//       },
//     });
//   }
// }

// export const quickBooks = new QuickBooksManager();
