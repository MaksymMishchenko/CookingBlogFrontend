import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { SKIP_GLOBAL_ERROR } from "../../http/http-context-token";

export const HttpErrorInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    
    const errorHandlerService = inject(ErrorHandlerService);
    const alertService = inject(AlertService);
    const errorMapperService = inject(ErrorMapperService);

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {

            if (request.context.get(SKIP_GLOBAL_ERROR)) {
                return throwError(() => error);
            }

            const mapped = errorMapperService.map(error);

            errorHandlerService.logErrorToConsole(error, mapped.devDescription);
            alertService.error(mapped.userMessage);

            return throwError(() => error);
        })
    );
};


