import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { Router } from "@angular/router";
import { AUTH_REDIRECT } from "../../http/auth-context";
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
                if (error.status === HttpStatusCode.Unauthorized) {
                    authService.logout();

                    const currentUrl = router.url;
                    const isOnLogin = currentUrl.includes(ADMIN_ROUTER_PATHS.LOGIN);

                    if (shouldRedirect && !isOnLogin) {
                        router.navigate(
                            [`/${ADMIN_ROUTER_PATHS.ADMIN}`, ADMIN_ROUTER_PATHS.LOGIN],
                            { queryParams: { returnUrl: currentUrl } }
                        );
                    }
                }

                return throwError(() => error);
            })
        );
};