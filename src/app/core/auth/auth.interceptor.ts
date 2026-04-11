import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {EMPTY, from, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';

const PUBLIC_URLS = ['/api/v1/auth/register'];

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const keycloak = inject(KeycloakService);

  // Skip interceptor for public endpoints
  if (PUBLIC_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  return from(keycloak.getToken()).pipe(
    switchMap(token => {
      const authReq = req.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
      });
      return next(authReq).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            return from(keycloak.updateToken(30)).pipe(
              switchMap(() => from(keycloak.getToken())),
              switchMap(newToken => {
                const retryReq = req.clone({
                  setHeaders: {Authorization: `Bearer ${newToken}`}
                });
                return next(retryReq);
              }),
              catchError(() => {
                void keycloak.login();
                return EMPTY;
              })
            );
          }
          return throwError(() => err);
        })
      );
    })
  );
};
