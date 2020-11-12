import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SignInCallbackGuard} from './guards/sign-in-callback-guard.service';
import {AuthenticatedGuard} from './guards/authenticated-guard.service';
import {CurrentUserResolver} from './resolvers/current-user.resolver';

import {HomeComponent} from './components/home/home.component';
import {InventoryComponent} from './components/inventory/inventory.component';

const routes: Routes = [
  {
    path: 'sign-in-callback',
    canActivate: [SignInCallbackGuard],
    children: []
  },

  {
    path: '',
    pathMatch: 'full',
    resolve: [CurrentUserResolver],
    component: HomeComponent
  },
  {
    path: 'inventory',
    canActivate: [AuthenticatedGuard],
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
