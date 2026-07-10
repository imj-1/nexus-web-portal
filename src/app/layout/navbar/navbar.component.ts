import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule} from '@angular/common';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {KeycloakService} from 'keycloak-angular';
import {filter} from 'rxjs';

const MOBILE_BREAKPOINT = '(max-width: 768px)';

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

  readonly mobileMenuOpen = signal(false);

  constructor(
    private router: Router,
    private keycloak: KeycloakService,
    breakpointObserver: BreakpointObserver
  ) {
    // Close the mobile panel after any navigation so it never
    // lingers over the new page.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.mobileMenuOpen.set(false));

    // Reset state if the viewport grows past the mobile breakpoint
    // (e.g. tablet rotation) so the desktop bar renders cleanly.
    breakpointObserver
      .observe(MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        if (!state.matches) {
          this.mobileMenuOpen.set(false);
        }
      });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

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
