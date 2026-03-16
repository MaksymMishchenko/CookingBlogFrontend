import { HttpClient, HttpContext, HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ErrorHandlerService } from "../../../shared/services/error/errorhandler.service";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { HttpErrorInterceptor } from "./httperror.interceptor";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { take } from "rxjs";
import { SKIP_GLOBAL_ERROR } from "../../http/http-context-token";

describe('HttpErrorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
        
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['logErrorToConsole']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error', 'warning']);
    const errorMapperSpy = jasmine.createSpyObj('ErrorMapperService', ['map']);

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
        
        errorMapperSpy.map.calls.reset();
        errorHandlerSpy.logErrorToConsole.calls.reset();
        alertServiceSpy.error.calls.reset();
        alertServiceSpy.warning.calls.reset();

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should map and handle HttpErrorResponse correctly', fakeAsync(() => {
        errorMapperSpy.map.and.returnValue({
            userMessage: 'User-friendly message',
            devDescription: 'Developer message'
        });

        http.get('/api/test', {
            context: new HttpContext().set(SKIP_GLOBAL_ERROR, false)
        }).pipe(take(1)).subscribe({
            next: () => fail('Expected an error'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush({}, { status: 500, statusText: 'Internal Server Error' });

        tick();

        expect(errorMapperSpy.map).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
        expect(errorHandlerSpy.logErrorToConsole).toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledWith('User-friendly message');
    }));

    it('should SKIP global handling if SKIP_GLOBAL_ERROR is true (for 404)', fakeAsync(() => {
        let actualError: HttpErrorResponse | undefined;
        
        http.get('/api/posts/123', {
            context: new HttpContext().set(SKIP_GLOBAL_ERROR, true)
        }).pipe(take(1)).subscribe({
            next: () => fail('Expected an error'),
            error: (error: HttpErrorResponse) => {
                actualError = error;
            }
        });

        const req = httpMock.expectOne('/api/posts/123');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });

        tick();

        expect(actualError?.status).toBe(404);
        expect(errorMapperSpy.map).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
    }));

    it('should show warning for 429 even if SKIP_GLOBAL_ERROR is true', fakeAsync(() => {
        errorMapperSpy.map.and.returnValue({ 
            userMessage: 'Too many requests', 
            devDescription: 'Rate limit hit' 
        });

        let actualError: HttpErrorResponse | undefined;

        http.get('/api/test', {
            context: new HttpContext().set(SKIP_GLOBAL_ERROR, true)
        }).subscribe({
            error: (err) => actualError = err
        });

        const req = httpMock.expectOne('/api/test');
        req.flush({}, { status: 429, statusText: 'Too Many Requests' });
        
        tick();
       
        expect(actualError?.status).toBe(429);
        expect(alertServiceSpy.warning).toHaveBeenCalledWith('Too many requests');
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
    }));

    describe('Authorization errors (401, 403)', () => {
        it('should NOT handle 401 Unauthorized and just rethrow it', fakeAsync(() => {
            let actualError: HttpErrorResponse | undefined;

            http.get('/api/protected').subscribe({
                next: () => fail('Should have failed'),
                error: (err) => actualError = err
            });

            const req = httpMock.expectOne('/api/protected');
            req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
            
            tick();
            
            expect(actualError?.status).toBe(401);
            expect(errorMapperSpy.map).not.toHaveBeenCalled();
            expect(alertServiceSpy.error).not.toHaveBeenCalled();
            expect(errorHandlerSpy.logErrorToConsole).not.toHaveBeenCalled();
        }));

        it('should NOT handle 403 Forbidden and just rethrow it', fakeAsync(() => {
            let actualError: HttpErrorResponse | undefined;

            http.get('/api/forbidden').subscribe({
                next: () => fail('Should have failed'),
                error: (err) => actualError = err
            });

            const req = httpMock.expectOne('/api/forbidden');
            req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
            
            tick();

            expect(actualError?.status).toBe(403);
            expect(errorMapperSpy.map).not.toHaveBeenCalled();
            expect(alertServiceSpy.error).not.toHaveBeenCalled();
        }));
    });
});