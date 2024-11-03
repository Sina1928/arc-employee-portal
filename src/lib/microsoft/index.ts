import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import { env } from "../config/env";

class MicrosoftGraphManager {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      env.microsoft.tenantId,
      env.microsoft.clientId,
      env.microsoft.clientSecret
    );

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ["https://graph.microsoft.com/.default"],
    });

    this.client = Client.initWithMiddleware({
      authProvider,
    });
  }

  async uploadFile(
    siteId: string,
    folderPath: string,
    fileName: string,
    content: Buffer
  ): Promise<string> {
    try {
      // Create folder if it doesn't exist
      try {
        await this.client
          .api(`/sites/${siteId}/drive/root:/${folderPath}`)
          .get();
      } catch {
        await this.client.api(`/sites/${siteId}/drive/root/children`).post({
          name: folderPath,
          folder: {},
          "@microsoft.graph.conflictBehavior": "replace",
        });
      }

      const response = await this.client
        .api(`/sites/${siteId}/drive/root:/${folderPath}/${fileName}:/content`)
        .put(content);

      return response.webUrl;
    } catch (error) {
      console.error("SharePoint upload error:", error);
      throw new Error("Failed to upload file to SharePoint");
    }
  }
}

export const microsoftGraph = new MicrosoftGraphManager();

// import { Client } from "@microsoft/microsoft-graph-client";
// import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
// import { ClientSecretCredential } from "@azure/identity";

// class MicrosoftGraphManager {
//   private client: Client;

//   constructor() {
//     const credential = new ClientSecretCredential(
//       process.env.AZURE_AD_TENANT_ID!,
//       process.env.AZURE_AD_CLIENT_ID!,
//       process.env.AZURE_AD_CLIENT_SECRET!
//     );

//     const authProvider = new TokenCredentialAuthenticationProvider(credential, {
//       scopes: ["https://graph.microsoft.com/.default"],
//     });

//     this.client = Client.initWithMiddleware({
//       authProvider,
//     });
//   }

//   // // src/lib/microsoft/index.ts
//   // import { Client } from "@microsoft/microsoft-graph-client";
//   // import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
//   // import { ClientSecretCredential } from "@azure/identity";
//   // import "isomorphic-fetch";

//   // interface GraphManagerConfig {
//   //   tenantId: string;
//   //   clientId: string;
//   //   clientSecret: string;
//   // }

//   // class MicrosoftGraphManager {
//   //   private client: Client;

//   //   constructor() {
//   //     const credential = new ClientSecretCredential(
//   //       process.env.AZURE_AD_TENANT_ID!,
//   //       process.env.AZURE_AD_CLIENT_ID!,
//   //       process.env.AZURE_AD_CLIENT_SECRET!
//   //     );

//   //     const authProvider = new TokenCredentialAuthenticationProvider(credential, {
//   //       scopes: ["https://graph.microsoft.com/.default"],
//   //     });

//   //     this.client = Client.initWithMiddleware({
//   //       authProvider,
//   //     });
//   //   }

//   async uploadFile(
//     siteId: string,
//     folderPath: string,
//     fileName: string,
//     content: Buffer
//   ): Promise<string> {
//     try {
//       // Create folder if it doesn't exist
//       try {
//         await this.client
//           .api(`/sites/${siteId}/drive/root:/${folderPath}`)
//           .get();
//       } catch {
//         await this.client.api(`/sites/${siteId}/drive/root/children`).post({
//           name: folderPath,
//           folder: {},
//           "@microsoft.graph.conflictBehavior": "replace",
//         });
//       }

//       // Upload file
//       const response = await this.client
//         .api(`/sites/${siteId}/drive/root:/${folderPath}/${fileName}:/content`)
//         .put(content);

//       return response.webUrl;
//     } catch (error) {
//       console.error("SharePoint upload error:", error);
//       throw new Error("Failed to upload file to SharePoint");
//     }
//   }

//   async createTeamsChannel(
//     teamId: string,
//     channelName: string
//   ): Promise<string> {
//     try {
//       const response = await this.client.api(`/teams/${teamId}/channels`).post({
//         displayName: channelName,
//         description: `Channel for ${channelName}`,
//       });

//       return response.id;
//     } catch (error) {
//       console.error("Teams channel creation error:", error);
//       throw new Error("Failed to create Teams channel");
//     }
//   }

//   async postToChannel(
//     teamId: string,
//     channelId: string,
//     message: string
//   ): Promise<void> {
//     try {
//       await this.client
//         .api(`/teams/${teamId}/channels/${channelId}/messages`)
//         .post({
//           body: {
//             content: message,
//           },
//         });
//     } catch (error) {
//       console.error("Teams message posting error:", error);
//       throw new Error("Failed to post message to Teams channel");
//     }
//   }

//   async getSharePointSite(): Promise<string> {
//     try {
//       const response = await this.client.api("/sites?search=*").get();

//       // Find the main site or return the first one
//       const site =
//         response.value.find((s: any) => s.name === "Main Site") ||
//         response.value[0];
//       return site.id;
//     } catch (error) {
//       console.error("SharePoint site lookup error:", error);
//       throw new Error("Failed to get SharePoint site");
//     }
//   }

//   async downloadFile(fileUrl: string): Promise<Buffer> {
//     try {
//       const response = await this.client.api(fileUrl).get();

//       return Buffer.from(response);
//     } catch (error) {
//       console.error("File download error:", error);
//       throw new Error("Failed to download file");
//     }
//   }
// }

// export const microsoftGraph = new MicrosoftGraphManager();
