import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {KeycloakService} from 'keycloak-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() showHamburger = true;
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(
    private router: Router,
    private keycloak: KeycloakService
  ) {}

  onToggle(): void {
    this.sidebarToggle.emit();
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  onSignIn(): void {
    void this.keycloak.login({redirectUri: window.location.origin + '/dashboard'});
  }

  onSignOut(): void {
    void this.keycloak.logout(window.location.origin);
  }

  onBrandClick(): void {
    void this.router.navigate([this.keycloak.isLoggedIn() ? '/dashboard' : '/']);
  }
}
