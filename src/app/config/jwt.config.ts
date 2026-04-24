import type { JwtConfig } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

function apiHostForJwt(): string {
  try {
    const { hostname, port } = new URL(environment.apiBaseUrl);
    const standardPorts = ['80', '443', ''];
    return port && !standardPorts.includes(port) ? `${hostname}:${port}` : hostname;
  } catch {
    return '';
  }
}

/** Mirrors legacy JWT_OPTIONS: token from localStorage, domain allowlist, auth routes excluded. */
export const jwtModuleConfig: JwtConfig = {
  tokenGetter: () => {
    try {
      return localStorage.getItem('AccessToken');
    } catch {
      return null;
    }
  },
  allowedDomains: ['localhost', apiHostForJwt()].filter((h) => h.length > 0),
  // String routes only match same-origin requests; RegExp matches full request URL (needed for cross-origin API).
  disallowedRoutes: [
    /\/api\/Auth\/Login/i,
    /\/api\/Auth\/RefreshToken/i,
    /\/api\/Auth\/RevokeToken/i,
  ],
  throwNoTokenError: false,
  skipWhenExpired: true,
};
