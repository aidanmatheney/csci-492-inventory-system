import {NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponentsModule} from './components/app-components.module';

import {Destroyed$} from './services/destroyed$.service';

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
    Destroyed$
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
