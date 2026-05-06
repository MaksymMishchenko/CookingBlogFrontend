import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { GlobalErrorDispatcherService } from "../../../shared/services/error/global-error-dispatcher.service";

export const HttpErrorInterceptor: HttpInterceptorFn = (request, next) => {
    const mapper = inject(ErrorMapperService);
    const dispatcher = inject(GlobalErrorDispatcherService);

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            const appError = mapper.mapHttpError(error);
            
            dispatcher.dispatch(appError, request.url);

            return throwError(() => appError);
        })
    );
};

