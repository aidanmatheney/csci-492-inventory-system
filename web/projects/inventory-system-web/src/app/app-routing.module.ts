import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SignInCallbackGuard} from './guards/sign-in-callback.guard';
import {SignOutCallbackGuard} from './guards/sign-out-callback.guard';
import {SignedInGuard} from './guards/signed-in.guard';
import {SecretaryGuard} from './guards/secretary.guard';
import {AdministratorGuard} from './guards/administrator.guard';
import {UnsavedPageChangesGuard} from './guards/unsaved-page-changes.guard';

import {CurrentAppUserResolver} from './resolvers/current-app-user.resolver';

import {HomeComponent} from './components/pages/home/home.component';
import {HelpComponent} from './components/pages/help/help.component';
import {InventoryComponent} from './components/pages/secretary/inventory/inventory.component';
import {CreateInventoryItemComponent} from './components/pages/secretary/inventory/create/create.component';
import {ViewInventoryItemComponent} from './components/pages/secretary/inventory/view/view.component';
import {EditInventoryItemComponent} from './components/pages/secretary/inventory/edit/edit.component';
import { AssigneesComponent } from './components/pages/secretary/inventory/assignees/assignees.component';
import {SettingsComponent} from './components/pages/settings/settings.component';
import {AppearanceSettingsComponent} from './components/pages/settings/appearance/appearance.component';
import {SecuritySettingsComponent} from './components/pages/settings/security/security.component';
import {AdministratorDashboardComponent} from './components/pages/administrator/dashboard/dashboard.component';
import {AppUsersComponent} from './components/pages/administrator/app-users/app-users.component';
import {CreateAppUserComponent} from './components/pages/administrator/app-users/create/create.component';
import {AppUserCreatedComponent} from './components/pages/administrator/app-users/created/created.component';
import {EditAppUserComponent} from './components/pages/administrator/app-users/edit/edit.component';

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
    children: [
      {
        path: '',
        component: InventoryComponent
      },
      {
        path: 'create',
        component: CreateInventoryItemComponent
      },
      {
        path: 'assignees',
        component: AssigneesComponent
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            component: ViewInventoryItemComponent
          },
          {
            path: 'edit',
            component: EditInventoryItemComponent
          }
        ]
      }
    ]
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
            component: AppUsersComponent
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
