import { inject, Injectable } from "@angular/core";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { ErrorHandlerService } from "./errorhandler.service";
import {
    AuthError, BusinessError, CriticalError, InfrastructureError,
    RateLimitError, ValidationError, AppError
} from "./error.types";
import { BACKEND_ERROR_CODES } from "./error-codes";
import { HttpStatusCode } from "@angular/common/http";
import { ADMIN_ROUTER_PATHS } from "../../../core/constants/api-endpoints";
import { Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class GlobalErrorDispatcherService {
    private errorHandlerService = inject(ErrorHandlerService);
    private alertService = inject(AlertService);
    private router = inject(Router);

    dispatch(appError: AppError, requestUrl: string): void {
        this.errorHandlerService.logAppError(appError);

        const isAdminApi = requestUrl.includes(`/${ADMIN_ROUTER_PATHS.ADMIN}/`);
        this.handleAlerts(appError, isAdminApi);
    }

    private handleAlerts(error: AppError, isAdminApi: boolean): void {
        if (error instanceof ValidationError) {
            this.handleValidationErrors(error);
            return;
        }

        if (error instanceof BusinessError) {
            this.handleBusinessErrors(error, isAdminApi);
            return;
        }

        if (error instanceof CriticalError || error instanceof InfrastructureError) {
            this.alertService.error(error.userMessage);
            return;
        }

        if (error instanceof RateLimitError || (error instanceof AuthError && error.status === HttpStatusCode.Forbidden)) {
            this.alertService.warning(error.userMessage);
        }
    }

    private handleValidationErrors(error: ValidationError): void {

        if (!error.errorCode) return;

        const emptyContentCodes: string[] = [
            BACKEND_ERROR_CODES.POST.CONTENT_EMPTY,
            BACKEND_ERROR_CODES.COMMENT.EMPTY
        ];

        if (emptyContentCodes.includes(error.errorCode)) {
            this.alertService.warning(error.message);
        }
    }

    private handleBusinessErrors(error: BusinessError, isAdminApi: boolean): void {
        const notFoundCodes: string[] = [
            BACKEND_ERROR_CODES.POST.NOT_FOUND,
            BACKEND_ERROR_CODES.CATEGORY.NOT_FOUND
        ];

        if (notFoundCodes.includes(error.errorCode!)) {
            if (isAdminApi) {
                this.alertService.error(error.message);
                this.router.navigate([ADMIN_ROUTER_PATHS.ADMIN, ADMIN_ROUTER_PATHS.DASHBOARD]);                
            } else {
                this.router.navigate(['/not-found']);
            }
        }
    }
}