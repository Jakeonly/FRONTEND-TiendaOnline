import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

import { isApiErrorResponse, isApiResponse } from './api-response.model';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) return event;
      if (!isApiResponse<unknown>(event.body)) return event;

      return event.clone({ body: event.body.data });
    }),
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (!isApiErrorResponse(error.error)) {
        return throwError(() => error);
      }

      const normalizedDetail = error.error.error.details ?? error.error.error.message;
      const normalizedError = new HttpErrorResponse({
        error: {
          ...error.error,
          detail: normalizedDetail,
          message: error.error.error.message,
        },
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined,
      });

      return throwError(() => normalizedError);
    }),
  );
