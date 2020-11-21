import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SignInCallbackGuard} from './guards/sign-in-callback.guard';
import {SignOutCallbackGuard} from './guards/sign-out-callback.guard';
import {SignedInGuard} from './guards/signed-in.guard';

import {CurrentAppUserResolver} from './resolvers/current-app-user.resolver';

import {HomeComponent} from './components/home/home.component';
import {HelpComponent} from './components/help/help.component';
import {InventoryComponent} from './components/inventory/inventory.component';

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
    pathMatch: 'full',
    resolve: [CurrentAppUserResolver],
    component: HomeComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'inventory',
    canActivate: [SignedInGuard],
    component: InventoryComponent
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
