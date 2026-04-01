import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',      route: '/dashboard'  },
    { label: 'Accounts',   icon: 'account_balance', route: '/accounts'   },
    { label: 'Transfers',  icon: 'swap_horiz',      route: '/transfers'  },
    { label: 'Payments',   icon: 'payments',        route: '/payments'   },
    { label: 'Statements', icon: 'description',     route: '/statements' },
    { label: 'Settings',   icon: 'settings',        route: '/settings'   },
  ];
}
