import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';

import {ToolbarComponent} from './toolbar/toolbar.component';
import {SignInComponent} from './sign-in/sign-in.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    SignInComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  exports: [
    ToolbarComponent,
    SignInComponent
  ]
})
export class AppComponentsModule { }
