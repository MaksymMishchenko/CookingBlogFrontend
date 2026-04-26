import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppError, AuthError, BusinessError, CriticalError, InfrastructureError, RateLimitError, ValidationError } from "./error.types";
import { USER_MESSAGES, DEV_DESCRIPTIONS } from './error.constants';
import { BaseResponse } from "../../interfaces/global.interface";
import { BACKEND_ERROR_CODES, HTTP_HEADERS, HTTP_STATUS } from "./error-codes";

@Injectable({
    providedIn: 'root'
})
export class ErrorMapperService {

    private handleAuthError(
        error: HttpErrorResponse,
        status: number,
        errorCode: string | undefined,
        devDetails: string
    ): AuthError {

        const authMap: Record<string, { msg: string; log?: string }> = {
            [BACKEND_ERROR_CODES.AUTH.INVALID_CREDENTIALS]: { msg: USER_MESSAGES.INVALID_CREDENTIALS },
            [BACKEND_ERROR_CODES.AUTH.SESSION_EXPIRED]: { msg: USER_MESSAGES.SESSION_EXPIRED },
            [BACKEND_ERROR_CODES.AUTH.AUTH_REQUIRED]: { msg: USER_MESSAGES.AUTH_REQUIRED },
            [BACKEND_ERROR_CODES.AUTH.INVALID_TOKEN]: { msg: USER_MESSAGES.INVALID_TOKEN },
            [BACKEND_ERROR_CODES.AUTH.FORBIDDEN]: {
                msg: USER_MESSAGES.FORBIDDEN,
                log: DEV_DESCRIPTIONS.FORBIDDEN_ACCESS(error.url || 'unknown', errorCode)
            }
        };
        
        let message = USER_MESSAGES.DEFAULT_AUTH_ERROR;
        let securityLog = devDetails;
       
        if (errorCode && authMap[errorCode]) {
            message = authMap[errorCode].msg;
            securityLog = authMap[errorCode].log ?? devDetails;
        }       
        else if (status === HttpStatusCode.Forbidden) {
            message = USER_MESSAGES.FORBIDDEN;
            securityLog = DEV_DESCRIPTIONS.FORBIDDEN_ACCESS(error.url || 'unknown', errorCode);
        }

        return new AuthError(message, status, securityLog, error, errorCode);
    }

    private handleValidationError(
        error: HttpErrorResponse,
        status: number,
        errorCode: string | undefined,
        devDetails: string,
        backendMessage?: string,
        apiResponseErrors?: any
    ): ValidationError {
        
        const validationMap: Record<string, { msg: string; log: string }> = {
            [BACKEND_ERROR_CODES.AUTH.DEFAULT_REGISTRATION_ERROR_CODE]: {
                msg: USER_MESSAGES.REGISTRATION_GENERIC,
                log: devDetails
            },
            [BACKEND_ERROR_CODES.COMMENT.EMPTY]: {
                msg: USER_MESSAGES.COMMENT.EMPTY,
                log: DEV_DESCRIPTIONS.COMMENT_SANITIZATION_EMPTY
            },
            [BACKEND_ERROR_CODES.POST.SLUG_CATEGORY_REQUIRED]: {
                msg: USER_MESSAGES.POST.SLUG_AND_CATEGORY_REQUIRED,
                log: devDetails
            },
            [BACKEND_ERROR_CODES.POST.CONTENT_EMPTY]: {
                msg: USER_MESSAGES.POST.CONTENT_IS_EMPTY,
                log: DEV_DESCRIPTIONS.POST_CONTENT_SANITIZATION_EMPTY
            }
        };
        
        let message = backendMessage || USER_MESSAGES.VALIDATION_ERROR;
        let validationLog = devDetails;
        
        if (errorCode && validationMap[errorCode]) {
            message = validationMap[errorCode].msg;
            validationLog = validationMap[errorCode].log;
        }

        return new ValidationError(
            message,
            status,
            validationLog,
            error,
            apiResponseErrors || {},
            errorCode
        );
    }

    private handleBusinessError(
        error: HttpErrorResponse,
        status: number,
        errorCode: string | undefined,
        devDetails: string
    ): BusinessError {
        
        const businessMap: Record<string, { msg: string; log?: string }> = {
            [BACKEND_ERROR_CODES.AUTH.USER_ALREADY_EXISTS]: {
                msg: USER_MESSAGES.USER_ALREADY_EXISTS
            },
            [BACKEND_ERROR_CODES.CATEGORY.NOT_FOUND]: {
                msg: USER_MESSAGES.CATEGORY_NOT_FOUND,
                log: DEV_DESCRIPTIONS.DATA_RACE_CONDITION('Category')
            },
            [BACKEND_ERROR_CODES.CATEGORY.OR_SLUG_EXISTS]: {
                msg: USER_MESSAGES.CATEGORY_OR_SLUG_EXISTS
            },
            [BACKEND_ERROR_CODES.POST.NOT_FOUND]: {
                msg: USER_MESSAGES.POST_NOT_FOUND,
                log: DEV_DESCRIPTIONS.DATA_RACE_CONDITION('Post')
            },
            [BACKEND_ERROR_CODES.POST.NOT_FOUND_MISMATCH]: {
                msg: USER_MESSAGES.POST.NOT_FOUND_BY_PATH_CODE
            },
            [BACKEND_ERROR_CODES.POST.ALREADY_EXISTS]: {
                msg: USER_MESSAGES.POST.ALREADY_EXIST_CODE
            }
        };
        
        let message = status === HttpStatusCode.Conflict
            ? USER_MESSAGES.CONCURRENCY_CONFLICT
            : USER_MESSAGES.RESOURCE_NOT_FOUND;

        let businessLog = devDetails;
        
        if (errorCode && businessMap[errorCode]) {
            message = businessMap[errorCode].msg;            
            businessLog = businessMap[errorCode].log ?? devDetails;
        }

        return new BusinessError(message, status, businessLog, error, errorCode);
    }

    private handleCriticalError(
        error: HttpErrorResponse,
        status: number,
        errorCode: string | undefined,
        apiResponseMessage?: string
    ): CriticalError {
       
        const criticalMap: Record<number, { msg: string; log: string }> = {
            [HttpStatusCode.InternalServerError]: {
                msg: USER_MESSAGES.INTERNAL_ERROR,
                log: DEV_DESCRIPTIONS.DATABASE_ISSUE
            },
            [HttpStatusCode.BadGateway]: {
                msg: USER_MESSAGES.BAD_GATEWAY,
                log: DEV_DESCRIPTIONS.BAD_GATEWAY
            },
            [HttpStatusCode.ServiceUnavailable]: {
                msg: USER_MESSAGES.SERVER_UNAVAILABLE,
                log: DEV_DESCRIPTIONS.MAINTENANCE
            },
            [HttpStatusCode.GatewayTimeout]: {
                msg: USER_MESSAGES.GATEWAY_TIMEOUT,
                log: DEV_DESCRIPTIONS.TIMEOUT
            }
        };
        
        let userMsg = criticalMap[status]?.msg || USER_MESSAGES.UNKNOWN_CRITICAL;
        let devMsg = criticalMap[status]?.log || DEV_DESCRIPTIONS.CRITICAL_SERVER_ERROR(status);
        
        if (status === HttpStatusCode.InternalServerError && errorCode === BACKEND_ERROR_CODES.AUTH.REG_CLAIM_FAILED) {
            userMsg = USER_MESSAGES.CLAIM_ASSIGNMENT_ERROR;
            devMsg = DEV_DESCRIPTIONS.CLAIM_FAILED('unknown', apiResponseMessage || 'Check database logs');
        }

        return new CriticalError(userMsg, status, devMsg, error, errorCode);
    }

    mapHttpError(error: HttpErrorResponse): AppError {
        const status = error.status;
        const apiResponse = error.error as BaseResponse;
        const backendMessage = apiResponse?.message;
        const devDetails = error.message;
        const errorCode = apiResponse?.errorCode;
        
        if (status === HTTP_STATUS.NETWORK_ERROR) {
            const isOffline = !navigator.onLine;
           
            const userMessage = isOffline
                ? USER_MESSAGES.NETWORK_ERROR
                : USER_MESSAGES.SERVER_UNREACHABLE;
            
            const technicalDetail = isOffline
                ? DEV_DESCRIPTIONS.NETWORK
                : DEV_DESCRIPTIONS.POSSIBLE_CORS_OR_SERVER_DOWN;

            return new InfrastructureError(
                userMessage,
                status,
                technicalDetail,
                error,
                errorCode || (isOffline ? 'OFFLINE' : 'SERVER_UNREACHABLE')
            );
        }

        if (status === HttpStatusCode.NotFound && !errorCode) {
            const requestedUrl = error.url || 'unknown url';

            return new InfrastructureError(
                USER_MESSAGES.NOT_FOUND_INFRA,
                status,
                DEV_DESCRIPTIONS.BAD_URL(requestedUrl),
                error,
                errorCode
            );
        }
       
        if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
            return this.handleAuthError(error, status, errorCode, devDetails);
        }        

        if (status === HttpStatusCode.UnprocessableEntity || status === HttpStatusCode.BadRequest) {
            return this.handleValidationError(error, status, errorCode, devDetails, backendMessage, apiResponse?.errors);
        }        

        if (status === HttpStatusCode.NotFound || status === HttpStatusCode.Conflict) {
            return this.handleBusinessError(error, status, errorCode, devDetails);
        }
                
        if (status === HttpStatusCode.PayloadTooLarge) {
            return new ValidationError(
                USER_MESSAGES.FILE_TOO_LARGE,
                status,
                DEV_DESCRIPTIONS.FILE_TOO_LARGE,
                error,
                apiResponse?.errors || {},
                errorCode
            );
        }
       
        if (status === HttpStatusCode.TooManyRequests) {
            const url = error.url || 'unknown url';

            const retryAfterHeader = error.headers.get(HTTP_HEADERS.RETRY_AFTER);
            const limitHeader = error.headers.get(HTTP_HEADERS.RATE_LIMIT);

            const retryAfterSeconds = Number(retryAfterHeader) || 0;
            return new RateLimitError(
                USER_MESSAGES.RATE_LIMIT_EXCEEDED,
                status,
                DEV_DESCRIPTIONS.RATE_LIMIT_EXCEEDED(url, retryAfterHeader, limitHeader),
                error,
                retryAfterSeconds,
                errorCode
            );
        }                    

        if (status >= 500) return this.handleCriticalError(error, status, errorCode, apiResponse?.message);

        return new CriticalError(USER_MESSAGES.UNKNOWN_ERROR, status, devDetails, error);
    }         
}
