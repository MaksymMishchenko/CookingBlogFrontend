import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppError, AuthError, BusinessError, CriticalError, InfrastructureError, RateLimitError, ValidationError } from "./error.types";
import { BaseResponse } from "../../interfaces/global.interface";
import { BACKEND_ERROR_CODES, HTTP_HEADERS, HTTP_STATUS } from "./error-codes";
import { UI_ERROR_MESSAGES } from "../../../core/constants/ui-messages.constants";
import { DEV_DESCRIPTIONS } from "../../../core/constants/dev-logs.constants";

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
            [BACKEND_ERROR_CODES.AUTH.INVALID_CREDENTIALS]: { msg: UI_ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS },
            [BACKEND_ERROR_CODES.AUTH.SESSION_EXPIRED]: { msg: UI_ERROR_MESSAGES.AUTH.SESSION_EXPIRED },
            [BACKEND_ERROR_CODES.AUTH.AUTH_REQUIRED]: { msg: UI_ERROR_MESSAGES.AUTH.AUTH_REQUIRED },
            [BACKEND_ERROR_CODES.AUTH.INVALID_TOKEN]: { msg: UI_ERROR_MESSAGES.AUTH.INVALID_TOKEN },
            [BACKEND_ERROR_CODES.AUTH.FORBIDDEN]: {
                msg: UI_ERROR_MESSAGES.AUTH.FORBIDDEN,
                log: DEV_DESCRIPTIONS.SECURITY.FORBIDDEN(error.url || 'unknown', errorCode)
            }
        };
        
        let message: string = UI_ERROR_MESSAGES.AUTH.DEFAULT_AUTH_ERROR;
        let securityLog: string = devDetails;
       
        if (errorCode && authMap[errorCode]) {
            message = authMap[errorCode].msg;
            securityLog = authMap[errorCode].log ?? devDetails;
        }       
        else if (status === HttpStatusCode.Forbidden) {
            message = UI_ERROR_MESSAGES.AUTH.FORBIDDEN;
            securityLog = DEV_DESCRIPTIONS.SECURITY.FORBIDDEN(error.url || 'unknown', errorCode);
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
                msg: UI_ERROR_MESSAGES.AUTH.REGISTRATION_GENERIC,
                log: devDetails
            },
            [BACKEND_ERROR_CODES.COMMENT.EMPTY]: {
                msg: UI_ERROR_MESSAGES.COMMENTS.EMPTY,
                log: DEV_DESCRIPTIONS.SECURITY.XSS_SANITIZATION_COMMENT
            },
            [BACKEND_ERROR_CODES.POST.SLUG_CATEGORY_REQUIRED]: {
                msg: UI_ERROR_MESSAGES.POSTS.SLUG_AND_CATEGORY_REQUIRED,
                log: devDetails
            },
            [BACKEND_ERROR_CODES.POST.CONTENT_EMPTY]: {
                msg: UI_ERROR_MESSAGES.POSTS.CONTENT_IS_EMPTY,
                log: DEV_DESCRIPTIONS.SECURITY.XSS_SANITIZATION_POST
            }
        };
        
        let message = backendMessage || UI_ERROR_MESSAGES.VALIDATION.VALIDATION_ERROR;
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
                msg: UI_ERROR_MESSAGES.AUTH.USER_ALREADY_EXISTS
            },
            [BACKEND_ERROR_CODES.CATEGORY.NOT_FOUND]: {
                msg: UI_ERROR_MESSAGES.DYNAMIC.NOT_FOUND('Category'),
                log: DEV_DESCRIPTIONS.BUSINESS_LOGIC.DATA_RACE('Category')
            },
            [BACKEND_ERROR_CODES.CATEGORY.OR_SLUG_EXISTS]: {
                msg: UI_ERROR_MESSAGES.CATEGORY.CATEGORY_OR_SLUG_EXISTS
            },
            [BACKEND_ERROR_CODES.POST.NOT_FOUND]: {
                msg: UI_ERROR_MESSAGES.DYNAMIC.NOT_FOUND('Post'),
                log: DEV_DESCRIPTIONS.BUSINESS_LOGIC.DATA_RACE('Post')
            },
            [BACKEND_ERROR_CODES.POST.NOT_FOUND_MISMATCH]: {
                msg: UI_ERROR_MESSAGES.POSTS.NOT_FOUND_BY_PATH_CODE
            },
            [BACKEND_ERROR_CODES.POST.ALREADY_EXISTS]: {
                msg: UI_ERROR_MESSAGES.POSTS.ALREADY_EXIST
            }
        };
        
        let message: string = status === HttpStatusCode.Conflict
            ? UI_ERROR_MESSAGES.VALIDATION.CONCURRENCY_CONFLICT
            : UI_ERROR_MESSAGES.COMMON.ACTION_FAILED;

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
                msg: UI_ERROR_MESSAGES.COMMON.INTERNAL_ERROR,
                log: DEV_DESCRIPTIONS.INFRASTRUCTURE.DATABASE_ISSUE
            },
            [HttpStatusCode.BadGateway]: {
                msg: UI_ERROR_MESSAGES.COMMON.SERVER_UNAVAILABLE,
                log: DEV_DESCRIPTIONS.INFRASTRUCTURE.BAD_GATEWAY
            },
            [HttpStatusCode.ServiceUnavailable]: {
                msg: UI_ERROR_MESSAGES.COMMON.SERVER_UNAVAILABLE,
                log: DEV_DESCRIPTIONS.INFRASTRUCTURE.MAINTENANCE
            },
            [HttpStatusCode.GatewayTimeout]: {
                msg: UI_ERROR_MESSAGES.COMMON.SERVER_UNAVAILABLE,
                log: DEV_DESCRIPTIONS.INFRASTRUCTURE.TIMEOUT
            }
        };
        
        let userMsg = criticalMap[status]?.msg || UI_ERROR_MESSAGES.COMMON.UNKNOWN_ERROR;
        let devMsg = criticalMap[status]?.log || DEV_DESCRIPTIONS.INFRASTRUCTURE.CRITICAL_SERVER_ERROR(status);
        
        if (status === HttpStatusCode.InternalServerError && errorCode === BACKEND_ERROR_CODES.AUTH.REG_CLAIM_FAILED) {
            userMsg = UI_ERROR_MESSAGES.AUTH.CLAIM_ASSIGNMENT_ERROR;
            devMsg = DEV_DESCRIPTIONS.AUTH_IDENTITY.CLAIM_FAILED('unknown', apiResponseMessage || 'Check database logs');
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
                ? UI_ERROR_MESSAGES.COMMON.NETWORK_ERROR
                : UI_ERROR_MESSAGES.COMMON.SERVER_UNREACHABLE;
            
            const technicalDetail = isOffline
                ? DEV_DESCRIPTIONS.INFRASTRUCTURE.NETWORK
                : DEV_DESCRIPTIONS.INFRASTRUCTURE.POSSIBLE_CORS_OR_SERVER_DOWN;

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
                UI_ERROR_MESSAGES.COMMON.ACTION_FAILED,
                status,
                DEV_DESCRIPTIONS.INFRASTRUCTURE.BAD_URL(requestedUrl),
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
                UI_ERROR_MESSAGES.VALIDATION.FILE_TOO_LARGE,
                status,
                DEV_DESCRIPTIONS.API_SPECIFIC.FILE_TOO_LARGE,
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
                UI_ERROR_MESSAGES.ACCESS.RATE_LIMIT_EXCEEDED,
                status,
                DEV_DESCRIPTIONS.BUSINESS_LOGIC.RATE_LIMIT(url, retryAfterHeader, limitHeader),
                error,
                retryAfterSeconds,
                errorCode
            );
        }                    

        if (status >= 500) return this.handleCriticalError(error, status, errorCode, apiResponse?.message);

        return new CriticalError(UI_ERROR_MESSAGES.COMMON.UNKNOWN_ERROR, status, devDetails, error);
    }         
}
