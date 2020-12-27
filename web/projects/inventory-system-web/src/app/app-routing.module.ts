import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SignInCallbackGuard} from './guards/sign-in-callback.guard';
import {SignOutCallbackGuard} from './guards/sign-out-callback.guard';
import {SignedInGuard} from './guards/signed-in.guard';
import {SecretaryGuard} from './guards/secretary.guard';
import {AdministratorGuard} from './guards/administrator.guard';
import {UnsavedPageChangesGuard} from './guards/unsaved-page-changes.guard';

import {CurrentAppUserResolver} from './resolvers/current-app-user.resolver';

import {HomeComponent} from './components/home/home.component';
import {HelpComponent} from './components/help/help.component';
import {InventoryComponent} from './components/secretary/inventory/inventory.component';
import {SettingsComponent} from './components/settings/settings.component';
import {AppearanceSettingsComponent} from './components/settings/appearance/appearance.component';
import {SecuritySettingsComponent} from './components/settings/security/security.component';
import {AdministratorDashboardComponent} from './components/administrator/dashboard/dashboard.component';
import {ManageAppUsersComponent} from './components/administrator/app-users/manage/manage.component';
import {CreateAppUserComponent} from './components/administrator/app-users/create/create.component';
import {AppUserCreatedComponent} from './components/administrator/app-users/created/created.component';
import {EditAppUserComponent} from './components/administrator/app-users/edit/edit.component';

const routes: Routes = [
  {
    path: 'sign-in-callback',
    canActivate: [SignInCallbackGuard],
    children: []
  },
  {
    path: 'sign-out-callback',
    canActivate: [SignOutCallbackGuard],
    children: []
  },

  {
    path: '',
    resolve: [CurrentAppUserResolver],
    component: HomeComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },

  {
    path: 'inventory',
    canActivate: [SecretaryGuard],
    component: InventoryComponent
  },

  {
    path: 'settings',
    canActivate: [SignedInGuard],
    children: [
      {
        path: '',
        component: SettingsComponent
      },
      {
        path: 'appearance',
        component: AppearanceSettingsComponent
      },
      {
        path: 'security',
        component: SecuritySettingsComponent
      }
    ]
  },

  {
    path: 'admin',
    canActivate: [AdministratorGuard],
    children: [
      {
        path: '',
        component: AdministratorDashboardComponent
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            component: ManageAppUsersComponent
          },
          {
            path: 'create',
            component: CreateAppUserComponent,
            canDeactivate: [UnsavedPageChangesGuard]
          },
          {
            path: ':id',
            children: [
              {
                path: 'created',
                component: AppUserCreatedComponent
              },
              {
                path: 'edit',
                component: EditAppUserComponent,
                canDeactivate: [UnsavedPageChangesGuard]
              }
            ]
          }
        ]
      }
    ]
  },

  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
