import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { USER_MESSAGES, DEV_DESCRIPTIONS } from './error.constants';
import { AppError, AuthError, BusinessError, CriticalError, InfrastructureError, RateLimitError, ValidationError } from "./error.types";
import { BaseResponse } from "../../interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})
export class ErrorMapperService {

    mapHttpError(error: HttpErrorResponse): AppError {
        const status = error.status;
        const apiResponse = error.error as BaseResponse;
        const backendMessage = apiResponse?.message;
        const devDetails = error.message;
       
        if (status === 0) {
            return new InfrastructureError(
                USER_MESSAGES.NETWORK_ERROR,
                status,
                navigator.onLine ? DEV_DESCRIPTIONS.CORS_OR_NETWORK : 'Offline',
                error
            );
        }

        if (status === 404 && !error.url?.includes('/api/')) {
            return new InfrastructureError(
                USER_MESSAGES.NOT_FOUND_INFRA,
                status,
                DEV_DESCRIPTIONS.BAD_URL,
                error
            );
        }
        
        if (status === 401 || status === 403) {
            return new AuthError(
                status === 401 ? USER_MESSAGES.SESSION_EXPIRED : USER_MESSAGES.FORBIDDEN,
                status,
                devDetails,
                error
            );
        }
       
        if (status === 422 || status === 400) {
            return new ValidationError(
                backendMessage || USER_MESSAGES.VALIDATION_ERROR,
                status,
                devDetails,
                error,
                apiResponse?.errors || {}
            );
        }
       
        if (status === 404 || status === 409) {
            return new BusinessError(
                status === 409 ? USER_MESSAGES.CONCURRENCY_CONFLICT : USER_MESSAGES.RESOURCE_NOT_FOUND,
                status,
                devDetails,
                error,
                apiResponse?.errorCode
            );
        }
        
        if (status === 429) {
            const retryAfter = Number(error.headers.get('Retry-After')) || 0;
            return new RateLimitError(
                USER_MESSAGES.RATE_LIMIT_EXCEEDED,
                status,
                `Rate limit hit. Retry after ${retryAfter}s`,
                error,
                retryAfter
            );
        }
        
        if (status >= 500) {            
            let devMsg = DEV_DESCRIPTIONS.CRITICAL_SERVER_ERROR(status);
            if (status === 504) devMsg = DEV_DESCRIPTIONS.TIMEOUT;
            if (status === 500) devMsg = DEV_DESCRIPTIONS.DATABASE_ISSUE;
            
            const userMsg = status === 503
                ? USER_MESSAGES.SERVER_UNAVAILABLE
                : USER_MESSAGES.INTERNAL_ERROR;

            return new CriticalError(
                backendMessage || userMsg,
                status,
                devMsg,
                error
            );
        }
        
        return new CriticalError(USER_MESSAGES.UNKNOWN_ERROR, status, devDetails, error);
    }
}