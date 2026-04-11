import {Routes} from '@angular/router';
import {ShellComponent} from './layout/shell/shell.component';
import {authGuard} from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
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
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'accounts/:id',
        loadComponent: () =>
          import('./features/accounts/account-detail/account-detail.component')
            .then(m => m.AccountDetailComponent)
      },
      {
        path: 'transfer/:accountId',
        loadComponent: () =>
          import('./features/transfer/transfer.component').then(m => m.TransferComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
