import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loading = false;
  serverError = '';

  constructor(private keycloak: KeycloakService) {}

  onSubmit() {
    this.loading = true;
    this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
  }
}
