import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { Router } from "@angular/router";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { USER_MESSAGES } from "../../../shared/services/error/error.constants";
import { AUTH_ERROR_STRATEGY } from "../../http/auth-context";

export const AuthInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    const authService = inject(AuthService);
    const alertService = inject(AlertService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${authService.token}`
            }
        });
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {                
                const strategy = request.context.get(AUTH_ERROR_STRATEGY);
                
                authService.logout();

                if (strategy === 'redirect') {
                    router.navigate(['/admin', 'login']);
                    alertService.emitInlineError(USER_MESSAGES.SESSION_EXPIRED);
                } else {                    
                    alertService.emitInlineError(USER_MESSAGES.SESSION_EXPIRED_COMMENT);
                }
            } else if (error.status === 403) {
                alertService.emitInlineError(USER_MESSAGES.ACCESS_DENIED);
            }

            return throwError(() => error);
        })
    );
};

