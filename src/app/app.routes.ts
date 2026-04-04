import {Routes} from '@angular/router';
import {ShellComponent} from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: ShellComponent,   // Layout shell wraps all protected routes
    // canActivate: [AuthGuard],
    children: []
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
