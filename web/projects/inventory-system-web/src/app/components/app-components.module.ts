import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';

import {AppDirectivesModule} from '../directives/app-directives.module';
import {AppPipesModule} from '../pipes/app-pipes.module';

import {AppComponent} from './app/app.component';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {LoadingContainerComponent} from './loading-container/loading-container.component';
import {SpinnerButtonContainerComponent} from './spinner-button-container/spinner-button-container.component';
import {ProcessingControlComponent} from './processing-control/processing-control.component';
import {SaveControlComponent} from './save-control/save-control.component';
import {PageComponent} from './page/page.component';
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component';
import {HomeComponent} from './home/home.component';
import {LandingComponent} from './landing/landing.component';
import {HelpComponent} from './help/help.component';
import {SecretaryDashboardComponent} from './secretary/dashboard/dashboard.component';
import {InventoryComponent} from './secretary/inventory/inventory.component';
import {SettingsComponent} from './settings/settings.component';
import {AppearanceSettingsComponent} from './settings/appearance/appearance.component';
import {SecuritySettingsComponent} from './settings/security/security.component';
import {AdministratorDashboardComponent} from './administrator/dashboard/dashboard.component';
import {ManageAppUsersComponent} from './administrator/app-users/manage/manage.component';
import {CreateAppUserComponent} from './administrator/app-users/create/create.component';
import {AppUserCreatedComponent} from './administrator/app-users/created/created.component';
import {EditAppUserComponent} from './administrator/app-users/edit/edit.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingSpinnerComponent,
    LoadingContainerComponent,
    SpinnerButtonContainerComponent,
    ProcessingControlComponent,
    SaveControlComponent,
    PageComponent,
    ConfirmDialogComponent,
    HomeComponent,
    LandingComponent,
    HelpComponent,
    SecretaryDashboardComponent,
    InventoryComponent,
    SettingsComponent,
    AppearanceSettingsComponent,
    SecuritySettingsComponent,
    AdministratorDashboardComponent,
    ManageAppUsersComponent,
    CreateAppUserComponent,
    AppUserCreatedComponent,
    EditAppUserComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatListModule,
    MatRadioModule,
    MatDialogModule,
    MatSidenavModule,

    AppDirectivesModule,
    AppPipesModule
  ],
  entryComponents: [
    ConfirmDialogComponent
  ]
})
export class AppComponentsModule { }
