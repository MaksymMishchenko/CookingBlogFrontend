import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { Router } from "@angular/router";
import { AUTH_REDIRECT } from "../../http/auth-context";
import { HTTP_STATUS } from "../../../shared/services/error/error-codes";
import { ADMIN_ROUTER_PATHS } from "../../constants/api-endpoints";

export const AuthInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    const authService = inject(AuthService);
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
                if (error.status === HTTP_STATUS.UNAUTHORIZED) {
                    authService.logout();

                    if (shouldRedirect && !router.url.includes(ADMIN_ROUTER_PATHS.LOGIN)) {
                        router.navigate([`/${ADMIN_ROUTER_PATHS.ADMIN}`, ADMIN_ROUTER_PATHS.LOGIN]);
                    }
                }

                return throwError(() => error);
            })
        );
};