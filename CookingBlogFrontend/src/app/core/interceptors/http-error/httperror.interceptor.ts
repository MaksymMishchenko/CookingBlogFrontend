import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { ErrorSkipService } from "../../../shared/services/error-skip/error-skip.service";
import { AlertService } from "../../../shared/services/alert/alert.service";

export const HttpErrorInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    const errorSkipService = inject(ErrorSkipService);
    const errorHandlerService = inject(ErrorHandlerService);
    const alertService = inject(AlertService);
    const errorMapperService = inject(ErrorMapperService);

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {

            if (errorSkipService.shouldSkipGlobalError(request, error)) {
                return throwError(() => error);
            }

            const mapped = errorMapperService.map(error);

            errorHandlerService.logErrorToConsole(error, mapped.devDescription);
            alertService.error(mapped.userMessage);

            return throwError(() => error);
        })
    );
};


