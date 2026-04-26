import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { AuthError, BusinessError, CriticalError, InfrastructureError, RateLimitError, ValidationError } from "../../../shared/services/error/error.types";
import { BACKEND_ERROR_CODES } from "../../../shared/services/error/error-codes";
import { ADMIN_ROUTER_PATHS } from "../../constants/api-endpoints";

export const HttpErrorInterceptor: HttpInterceptorFn = (request, next) => {
    const errorHandlerService = inject(ErrorHandlerService);
    const alertService = inject(AlertService);
    const mapper = inject(ErrorMapperService);

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            const appError = mapper.mapHttpError(error);
            errorHandlerService.logAppError(appError);
            const isCritical = appError instanceof CriticalError || appError instanceof InfrastructureError;

            const isRateLimit = appError instanceof RateLimitError;
            const isForbidden = appError instanceof AuthError && appError.status === HttpStatusCode.Forbidden;
            const isBusinessError = appError instanceof BusinessError;
            const isAdminApi = request.url.includes(`/${ADMIN_ROUTER_PATHS.ADMIN}/`); 

            if (appError instanceof ValidationError) {
                if (appError.errorCode === BACKEND_ERROR_CODES.POST.CONTENT_EMPTY ||
                    appError.errorCode === BACKEND_ERROR_CODES.COMMENT.EMPTY) {
                    alertService.warning(appError.message);
                }
            }

            if (isBusinessError && appError.errorCode === BACKEND_ERROR_CODES.POST.NOT_FOUND) {
                if (isAdminApi) {
                    alertService.error(appError.message);
                }
            }

            if (isCritical) {
                alertService.error(appError.userMessage);
            }
            else if (isRateLimit || isForbidden) {
                alertService.warning(appError.userMessage);
            }

            return throwError(() => appError);
        })
    );
};

