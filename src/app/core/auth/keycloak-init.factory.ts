import {KeycloakService} from 'keycloak-angular';
import {environment} from '../../../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
                               config: {
                                 url: environment.keycloakUrl,
                                 realm: environment.keycloakRealm,
                                 clientId: environment.keycloakClientId
                               },
                               initOptions: {
                                 onLoad: 'check-sso',
                                 checkLoginIframe: false,
                                 silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
                               }
                             }).catch((err) => {
    console.error('Keycloak init failed, continuing without auth:', err);
    return false;
  });
}
