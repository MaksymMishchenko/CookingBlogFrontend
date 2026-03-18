import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { Router } from "@angular/router";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { USER_MESSAGES } from "../../../shared/services/error/error.constants";
import { AUTH_REDIRECT } from "../../http/auth-context";

export const AuthInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    const authService = inject(AuthService);
    const alertService = inject(AlertService);
    const router = inject(Router);

    const shouldRedirect = request.context.get(AUTH_REDIRECT);

    if (authService.isAuthenticated() && authService.token) {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${authService.token}`
            }
        });
    }

    return next(request)
        .pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    authService.logout();

                    if (shouldRedirect) {                        
                        //if (!router.url.includes('/admin/login')) {
                            console.log('Emitting error message and navigating...');
                            alertService.emitInlineError(USER_MESSAGES.SESSION_EXPIRED);
                            router.navigate(['/admin', 'login']);                            
                       // }                        
                    }

                } else if (error.status === 403) {
                    alertService.warning(USER_MESSAGES.ACCESS_DENIED);
                }

                return throwError(() => error);
            })
        );
};




