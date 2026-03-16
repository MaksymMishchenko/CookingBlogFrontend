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
    const mapper = inject(ErrorMapperService);

    const showNotification = (message: string, status: number) => {
        if (status === 429) {
            alertService.warning(message);
        } else {
            alertService.error(message);
        }
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            const skipGlobal = request.context.get(SKIP_GLOBAL_ERROR);

            if (error.status === 401 || error.status === 403) {
                return throwError(() => error);
            }

            if (skipGlobal) {
                if (error.status === 429 || error.status === 0 || error.status >= 500) {
                    const mapped = mapper.map(error);
                    showNotification(mapped.userMessage, error.status);                    
                }               
                return throwError(() => error);
            }            

            const mapped = mapper.map(error);

            errorHandlerService.logErrorToConsole(error, mapped.devDescription);
            alertService.error(mapped.userMessage);

            return throwError(() => error);
        })
    );
};


