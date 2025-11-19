import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { AuthErrorService } from "../../../admin/shared/services/auth-error/auth-error.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { HttpErrorInterceptor } from "./httperror.interceptor";
import { ErrorSkipService } from "../../../shared/services/error-skip/error-skip.service";

describe('HttpErrorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;

    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['logErrorToConsole']);
    const authErrorSpy = jasmine.createSpyObj('AuthErrorService', ['emitError']);
    const errorMapperSpy = jasmine.createSpyObj('ErrorMapperService', ['map']);
    const errorSkipSpy = jasmine.createSpyObj('ErrorSkipService', ['shouldSkipGlobalError']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([HttpErrorInterceptor])),
                provideHttpClientTesting(),
                { provide: ErrorHandlerService, useValue: errorHandlerSpy },
                { provide: AuthErrorService, useValue: authErrorSpy },
                { provide: ErrorMapperService, useValue: errorMapperSpy },
                { provide: ErrorSkipService, useValue: errorSkipSpy }
            ]
        });        

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should map and handle HttpErrorResponse correctly', () => {
        errorSkipSpy.shouldSkipGlobalError.and.returnValue(false);

        errorMapperSpy.map.and.returnValue({
            userMessage: 'User-friendly message',
            devDescription: 'Developer message'
        });

        http.get('/api/test').subscribe({
            next: () => fail('Expected an error'),
            error: (error) => {
                console.log('ERR >>>', error);
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush({}, { status: 500, statusText: 'Internal Server Error' });

        expect(errorMapperSpy.map).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
        expect(errorHandlerSpy.logErrorToConsole).toHaveBeenCalled();
        expect(authErrorSpy.emitError).toHaveBeenCalledWith('User-friendly message');
    });

    it('should SKIP global handling if ErrorSkipService returns true (e.g., Logical 404)', () => {
        errorSkipSpy.shouldSkipGlobalError.and.returnValue(true);

        let actualError: HttpErrorResponse | undefined;
        http.get('/api/posts/123').subscribe({
            next: () => fail('Expected an error, but got successful next.'),
            error: (error: HttpErrorResponse) => {
                actualError = error;
            }
        });

        const req = httpMock.expectOne('/api/posts/123');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });

        expect(errorSkipSpy.shouldSkipGlobalError).toHaveBeenCalledTimes(1);

        expect(actualError).toBeInstanceOf(HttpErrorResponse);
        expect(actualError?.status).toBe(404);

        expect(errorMapperSpy.map).not.toHaveBeenCalled();
        expect(errorHandlerSpy.logErrorToConsole).not.toHaveBeenCalled();
        expect(authErrorSpy.emitError).not.toHaveBeenCalled();
    });

});