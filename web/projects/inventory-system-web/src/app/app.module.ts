import {NgModule, Provider} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponentsModule} from './components/app-components.module';

import {Destroyed$} from './services/destroyed$.service';

import {AuthenticationInterceptor} from './interceptors/authentication.interceptor';

import {AppComponent} from './app.component';

@NgModule({
  declarations: [AppComponent],
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
export class AppModule { }
