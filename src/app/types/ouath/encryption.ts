export interface OAuthTokenResponse {
  token: string;
  expiresAt: string;
}

export interface EncryptResponse {
  encrypted: string;
}

export interface DecryptResponse {
  decrypted: any;
}
