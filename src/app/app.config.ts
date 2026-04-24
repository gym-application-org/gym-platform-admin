import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

import { AppRoutingModule } from './app-routing.module';
import { jwtModuleConfig } from './config/jwt.config';
import { TokenExpirationInterceptor } from './interceptors/token-expiration.interceptor';
import { repositoryProviders } from './config/repository.providers';

export interface AppSettings {
  language?: string;
  [key: string]: any;
}

export const defaults: AppSettings = {
  language: 'en',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(AppRoutingModule),
    importProvidersFrom(JwtModule.forRoot({ config: jwtModuleConfig })),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenExpirationInterceptor,
      multi: true,
    },
    ...repositoryProviders,
  ],
};
