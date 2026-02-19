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
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error']);
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

        tick(0);

        expect(errorMapperSpy.map).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse));
        expect(errorHandlerSpy.logErrorToConsole).toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledWith('User-friendly message');
    }));

    it('should SKIP global handling if ErrorSkipService returns true (e.g., Logical 404)', fakeAsync(() => {
        
        let actualError: HttpErrorResponse | undefined;
        http.get('/api/posts/123', {
            context: new HttpContext().set(SKIP_GLOBAL_ERROR, true)
        }).pipe(take(1)).subscribe({
            next: () => fail('Expected an error, but got successful next.'),
            error: (error: HttpErrorResponse) => {
                actualError = error;
            }
        });

        const req = httpMock.expectOne('/api/posts/123');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });

        tick(0);        

        expect(actualError).toBeInstanceOf(HttpErrorResponse);
        expect(actualError?.status).toBe(404);

        expect(errorMapperSpy.map).not.toHaveBeenCalled();
        expect(errorHandlerSpy.logErrorToConsole).not.toHaveBeenCalled();
    }));
});