import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { HttpErrorInterceptor } from "./httperror.interceptor";
import { AlertService } from "../../../shared/services/alert/alert.service";
import {
    AuthError,
    BusinessError,
    CriticalError,
    RateLimitError,
    ValidationError
} from "../../../shared/services/error/error.types";
import { BACKEND_ERROR_CODES } from "../../../shared/services/error/error-codes";
import { ADMIN_ROUTER_PATHS } from "../../constants/api-endpoints";

describe('HttpErrorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;

    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['logAppError']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error', 'warning']);
    const errorMapperSpy = jasmine.createSpyObj('ErrorMapperService', ['mapHttpError']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([HttpErrorInterceptor])),
                provideHttpClientTesting(),
                { provide: ErrorHandlerService, useValue: errorHandlerSpy },
                { provide: AlertService, useValue: alertServiceSpy },
                { provide: ErrorMapperService, useValue: errorMapperSpy }
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);

        errorMapperSpy.mapHttpError.calls.reset();
        errorHandlerSpy.logAppError.calls.reset();
        alertServiceSpy.error.calls.reset();
        alertServiceSpy.warning.calls.reset();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should show ERROR alert for critical errors (500)', fakeAsync(() => {
        // Arrange
        const mockAppError = new CriticalError('Server Crash', 500, 'Dev Details', '');
        errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

        // Act
        http.get('/api/test').subscribe({
            error: (err) => expect(err).toBe(mockAppError)
        });

        const req = httpMock.expectOne('/api/test');
        req.flush({}, { status: 500, statusText: 'Server Error' });
        tick();

        // Assert
        expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(mockAppError);
        expect(alertServiceSpy.error).toHaveBeenCalledWith('Server Crash');
    }));

    it('should show WARNING for RateLimit with specific error code', fakeAsync(() => {
        // Arrange
        const mockAppError = new RateLimitError(
            'Too many requests',
            429,
            'Dev Msg',
            null,
            60,
            BACKEND_ERROR_CODES.INFRASTRUCTURE.LIMIT_EXCEEDED
        );
        errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

        // Act
        http.get('/api/test').subscribe({
            next: () => fail('Should have failed with RateLimitError'),
            error: (err) => {
                expect(err).toBe(mockAppError);
            }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush({}, { status: 429, statusText: 'Too Many Requests' });

        tick();

        // Assert
        expect(alertServiceSpy.warning).toHaveBeenCalledWith('Too many requests');
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
        expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(mockAppError);
    }));

    it('should show WARNING for Forbidden (403) access', fakeAsync(() => {
        // Arrange
        const mockAppError = new AuthError(
            'Access Denied',
            403,
            'Forbidden Dev',
            null,
            BACKEND_ERROR_CODES.AUTH.FORBIDDEN
        );
        errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

        // Act
        http.get('/api/admin').subscribe({
            next: () => fail('Should have failed with AuthError'),
            error: (err) => {
                expect(err).toBe(mockAppError);
            }
        });

        const req = httpMock.expectOne('/api/admin');
        req.flush({}, { status: 403, statusText: 'Forbidden' });

        tick();

        // Assert
        expect(alertServiceSpy.warning).toHaveBeenCalledWith('Access Denied');
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
        expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(mockAppError);
    }));

    it('should be SILENT (no alert) for Validation errors', fakeAsync(() => {
        // Arrange
        const mockAppError = new ValidationError('Bad Input', 400, 'Validation failed', null, { field: ['error'] });
        errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

        // Act
        http.post('/api/data', {}).subscribe({
            next: () => fail('Should have failed with validation error'),
            error: (err) => {
                expect(err).toBe(mockAppError);
            }
        });

        const req = httpMock.expectOne('/api/data');
        req.flush({}, { status: 400, statusText: 'Bad Request' });

        tick();

        // Assert
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
        expect(alertServiceSpy.warning).not.toHaveBeenCalled();
        expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(mockAppError);
    }));

    describe('BusinessError (POST_NOT_FOUND)', () => {

        it('should show ERROR alert when POST_NOT_FOUND occurs in ADMIN context', fakeAsync(() => {
            // Arrange
            const mockAppError = new BusinessError(
                'Post not found',
                404,
                'Dev log',
                null,
                BACKEND_ERROR_CODES.POST.NOT_FOUND
            );
            errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

            const adminUrl = `/api/${ADMIN_ROUTER_PATHS.ADMIN}/posts/123`;

            // Act
            http.get(adminUrl).subscribe({
                error: (err) => expect(err).toBe(mockAppError)
            });

            const req = httpMock.expectOne(adminUrl);
            req.flush({}, { status: 404, statusText: 'Not Found' });
            tick();

            // Assert
            expect(alertServiceSpy.error).toHaveBeenCalledWith('Post not found');
            expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(mockAppError);
        }));

        it('should be SILENT when POST_NOT_FOUND occurs in PUBLIC context', fakeAsync(() => {
            // Arrange
            const mockAppError = new BusinessError(
                'Post not found',
                404,
                'Dev log',
                null,
                BACKEND_ERROR_CODES.POST.NOT_FOUND
            );
            errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

            const publicUrl = '/api/posts/some-slug';

            // Act
            http.get(publicUrl).subscribe({
                error: (err) => expect(err).toBe(mockAppError)
            });

            const req = httpMock.expectOne(publicUrl);
            req.flush({}, { status: 404, statusText: 'Not Found' });
            tick();

            // Assert
            expect(alertServiceSpy.error).not.toHaveBeenCalled();
            expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(mockAppError);
        }));
    });
});