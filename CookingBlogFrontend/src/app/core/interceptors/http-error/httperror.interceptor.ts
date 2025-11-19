import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { AuthErrorService } from "../../../admin/shared/services/auth-error/auth-error.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { ErrorSkipService } from "../../../shared/services/error-skip/error-skip.service";

export const HttpErrorInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    const errorSkipService = inject(ErrorSkipService);
    const errorHandlerService = inject(ErrorHandlerService);
    const authErrorService = inject(AuthErrorService);
    const errorMapperService = inject(ErrorMapperService);

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {

            if (errorSkipService.shouldSkipGlobalError(request, error)) {
                return throwError(() => error);
            }

            const mapped = errorMapperService.map(error);

            errorHandlerService.logErrorToConsole(error, mapped.devDescription);
            authErrorService.emitError(mapped.userMessage);

            return throwError(() => error);
        })
    );
};


