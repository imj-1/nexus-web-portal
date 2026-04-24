import {KeycloakService} from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
    config: {
      url: 'http://localhost:8180',
      realm: 'nexus',
      clientId: 'nexus-web-portal'
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      checkLoginIframe: false
    },
    enableBearerInterceptor: true
  });
}
