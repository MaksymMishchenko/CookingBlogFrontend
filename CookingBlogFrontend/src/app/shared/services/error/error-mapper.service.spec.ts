import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { ErrorMapperService } from "./error-mapper.service";
import { HTTP_STATUS, BACKEND_ERROR_CODES } from "./error-codes";
import {
    InfrastructureError,
    AuthError,
    ValidationError,
    BusinessError,
    RateLimitError,
    CriticalError
} from "./error.types";
import { UI_ERROR_MESSAGES } from "../../../core/constants/ui-messages.constants";
import { DEV_DESCRIPTIONS } from "../../../core/constants/dev-logs.constants";

describe('ErrorMapperService', () => {
    let mapperService: ErrorMapperService;

    beforeEach(() => {
        mapperService = new ErrorMapperService();
    });

    it('should map network error (status 0) when offline', () => {
        // Arrange
        spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
        const error = new HttpErrorResponse({ status: HTTP_STATUS.NETWORK_ERROR });

        // Act
        const result = mapperService.mapHttpError(error);

        // Assert
        expect(result).toBeInstanceOf(InfrastructureError);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.COMMON.NETWORK_ERROR);
        expect(result.developerDetails).toBe(DEV_DESCRIPTIONS.INFRASTRUCTURE.NETWORK);
    });

    it('should map status 0 as SERVER_UNREACHABLE when online', () => {
        spyOnProperty(navigator, 'onLine', 'get').and.returnValue(true);
        const error = new HttpErrorResponse({ status: 0 });
        const result = mapperService.mapHttpError(error);

        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.COMMON.SERVER_UNREACHABLE);
        expect(result.errorCode).toBe('SERVER_UNREACHABLE');
    });

    describe('AuthError mapping', () => {

        it('should map INVALID_CREDENTIALS errorCode to specific message', () => {
            // Arrange
            const error = new HttpErrorResponse({
                status: 401,
                error: { errorCode: BACKEND_ERROR_CODES.AUTH.INVALID_CREDENTIALS }
            });

            // Act
            const result = mapperService.mapHttpError(error);

            // Assert
            expect(result).toBeInstanceOf(AuthError);
            expect(result.userMessage).toBe(UI_ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        });

        it('should map REG_CLAIM_FAILED status 500 to specific message', () => {
            // Arrange
            const error = new HttpErrorResponse({
                status: 500,
                error: { errorCode: BACKEND_ERROR_CODES.AUTH.REG_CLAIM_FAILED, message: 'DB Down' }
            });

            // Act
            const result = mapperService.mapHttpError(error);

            // Assert
            expect(result.userMessage).toBe(UI_ERROR_MESSAGES.AUTH.CLAIM_ASSIGNMENT_ERROR);
            expect(result.developerDetails).toContain('DB Down');
        });

        it('should map 403 status or FORBIDDEN errorCode to forbidden message', () => {
            // Arrange
            const errorByStatus = new HttpErrorResponse({
                status: 403
            });

            const errorByCode = new HttpErrorResponse({
                status: 401,
                error: { errorCode: BACKEND_ERROR_CODES.AUTH.FORBIDDEN }
            });

            // Act
            const resultByStatus = mapperService.mapHttpError(errorByStatus);
            const resultByCode = mapperService.mapHttpError(errorByCode);

            // Assert
            expect(resultByStatus.userMessage).toBe(UI_ERROR_MESSAGES.AUTH.FORBIDDEN);
            expect(resultByCode.userMessage).toBe(UI_ERROR_MESSAGES.AUTH.FORBIDDEN);
        });

        it('should return DEFAULT_AUTH_ERROR when status is 401 but errorCode is unknown', () => {
            // Arrange
            const error = new HttpErrorResponse({
                status: 401,
                error: { errorCode: 'SOME_RANDOM_CODE' }
            });

            // Act
            const result = mapperService.mapHttpError(error);

            // Assert
            expect(result.userMessage).toBe(UI_ERROR_MESSAGES.AUTH.DEFAULT_AUTH_ERROR);
        });
    });

    it('should map 404 as InfrastructureError when NO errorCode is present (Bad URL)', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 404,
            url: 'http://api.example.com/wrong-endpoint'
        });

        // Act
        const result = mapperService.mapHttpError(error) as InfrastructureError;

        // Assert
        expect(result).toBeInstanceOf(InfrastructureError);       
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.COMMON.ACTION_FAILED);        
        const expectedDevLog = DEV_DESCRIPTIONS.INFRASTRUCTURE.BAD_URL(error.url!);
        expect(result.developerDetails).toBe(expectedDevLog);
    });

    it('should map 404 as BusinessError when errorCode IS present (Resource missing)', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 404,
            error: { errorCode: 'USER_NOT_FOUND', message: 'User not found' }
        });

        // Act
        const result = mapperService.mapHttpError(error);

        // Assert
        expect(result).toBeInstanceOf(BusinessError);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.COMMON.ACTION_FAILED);
        expect(result.errorCode).toBe('USER_NOT_FOUND');
    });

    it('should map 409 Conflict as BusinessError', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 409,
            error: { errorCode: 'VERSION_MISMATCH' }
        });

        // Act
        const result = mapperService.mapHttpError(error);

        // Assert
        expect(result).toBeInstanceOf(BusinessError);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.VALIDATION.CONCURRENCY_CONFLICT);
        expect(result.errorCode).toBe('VERSION_MISMATCH');
    });

    it('should map 413 Payload Too Large as ValidationError', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 413
        });

        // Act
        const result = mapperService.mapHttpError(error);

        // Assert
        expect(result).toBeInstanceOf(ValidationError);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.VALIDATION.FILE_TOO_LARGE);
    });

    it('should map 422 Unprocessable Entity as ValidationError with backend errors', () => {
        // Arrange
        const backendErrors = { email: ['Invalid format'] };
        const error = new HttpErrorResponse({
            status: 422,
            error: { message: 'Validation failed', errors: backendErrors }
        });

        // Act
        const result = mapperService.mapHttpError(error) as ValidationError;

        // Assert
        expect(result).toBeInstanceOf(ValidationError);
        expect(result.userMessage).toBe('Validation failed');
        expect(result.errors).toEqual(backendErrors);
    });

    it('should fallback to default validation message when errorCode is unknown', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 400,
            error: { message: 'Custom Backend Msg', errorCode: 'UNKNOWN_VAL_CODE' }
        });

        // Act
        const result = mapperService.mapHttpError(error);

        // Assert
        expect(result.userMessage).toBe('Custom Backend Msg');
    });

    it('should map 429 Rate Limit error and extract Retry-After header', () => {
        // Arrange
        const url = '/api/data';
        const headers = new HttpHeaders().set('Retry-After', '30');
        const error = new HttpErrorResponse({
            status: 429,
            url: url,
            headers: headers
        });

        // Act
        const result = mapperService.mapHttpError(error) as RateLimitError;

        // Assert
        expect(result).toBeInstanceOf(RateLimitError);
        expect(result.retryAfter).toBe(30);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.ACCESS.RATE_LIMIT_EXCEEDED);
    });    

    it('should map 500 Internal Server Error as CriticalError', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 500,
            statusText: 'Internal Server Error',
            url: 'http://api.example.com'
        });

        // Act
        const result = mapperService.mapHttpError(error) as CriticalError;

        // Assert
        expect(result).toBeInstanceOf(CriticalError);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.COMMON.INTERNAL_ERROR);
        expect(result.developerDetails).toBe(DEV_DESCRIPTIONS.INFRASTRUCTURE.DATABASE_ISSUE);
    });

    it('should map unknown 4xx status as default CriticalError', () => {
        // Arrange
        const error = new HttpErrorResponse({
            status: 418,
            statusText: "I'm a teapot"
        });

        // Act
        const result = mapperService.mapHttpError(error);

        // Assert
        expect(result).toBeInstanceOf(CriticalError);
        expect(result.userMessage).toBe(UI_ERROR_MESSAGES.COMMON.UNKNOWN_ERROR);
    });
});