import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Permite omitir autenticacion en llamadas puntuales (ej: login).
  if (req.headers.has('X-Skip-Auth')) {
    return next(req.clone({ headers: req.headers.delete('X-Skip-Auth') }));
  }

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(environment.authTokenStorageKey)
      : null;

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
