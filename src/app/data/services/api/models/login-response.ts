export interface AccessToken {
  token: string;
  expiration: string; 
}

export interface RefreshToken {
  token: string;
  expires: string; 
  created: string; 
  createdByIp: string;
}

export interface LoginResponse {
  accessToken?: AccessToken;
  refreshToken?: RefreshToken;
}