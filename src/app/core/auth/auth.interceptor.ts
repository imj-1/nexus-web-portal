import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();

  if (!token || req.url.includes('/api/v1/auth/')) return next(req);

  return next(req.clone({
    setHeaders: {Authorization: `Bearer ${token}`}
  }));
};
