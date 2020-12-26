import {NgModule, Provider} from '@angular/core';
import {takeUntil} from 'rxjs/operators';

import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponentsModule} from './components/app-components.module';

import {AuthenticationService} from './services/authentication.service';
import {Destroyed$} from './services/destroyed$.service';

import {AuthenticationInterceptor} from './interceptors/authentication.interceptor';

import {AppComponent} from './components/app/app.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,

    AppRoutingModule,
    AppComponentsModule
  ],
  providers: [
    Destroyed$,

    ...[
      AuthenticationInterceptor
    ].map((interceptor): Provider => ({provide: HTTP_INTERCEPTORS, useClass: interceptor, multi: true}))
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(
    authenticationService: AuthenticationService,
    destroyed$: Destroyed$
  ) {
    // Subscribe to oidcUser$ immediately so AuthenticationService can detect whether the first route loaded is the
    // sign-in callback. If so, AuthenticationService will wait to see if SignInCallbackGuard successfully loads the
    // OIDC user. If so, AuthenticationService will skip attempting to load the OIDC user from storage or a silent
    // sign-in.
    authenticationService.oidcUser$.pipe(takeUntil(destroyed$)).subscribe();
  }
}
