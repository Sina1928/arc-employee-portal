// src/types/intuit-oauth.d.ts

interface OAuthResponse {
  getJson(): {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    realmId?: string;
    x_refresh_token_expires_in?: number;
    token_type?: string;
  };
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  environment: string;
  redirectUri: string;
}

interface AuthorizeUriOptions {
  scope: string[];
  state: string;
}

declare module "intuit-oauth" {
  export default class OAuthClient {
    constructor(config: OAuthConfig);

    authorizeUri(options: AuthorizeUriOptions): string;

    createToken(url: string): Promise<OAuthResponse>;

    refreshUsingToken(refreshToken: string): Promise<OAuthResponse>;

    makeApiCall(options: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: any;
    }): Promise<any>;

    getToken(): {
      token_type: string;
      access_token: string;
      expires_in: number;
      refresh_token: string;
      x_refresh_token_expires_in: number;
    };

    setToken(token: {
      token_type: string;
      access_token: string;
      expires_in: number;
      refresh_token: string;
      x_refresh_token_expires_in: number;
    }): void;

    async revoke(): Promise<void>;
  }
}
