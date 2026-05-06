import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ErrorMapperService } from "../../../shared/services/error/error-mapper.service";
import { GlobalErrorDispatcherService } from "../../../shared/services/error/global-error-dispatcher.service";
import { HttpErrorInterceptor } from "./httperror.interceptor";
import { CriticalError } from "../../../shared/services/error/error.types";

describe('HttpErrorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
   
    const errorMapperSpy = jasmine.createSpyObj('ErrorMapperService', ['mapHttpError']);
    const dispatcherSpy = jasmine.createSpyObj('GlobalErrorDispatcherService', ['dispatch']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([HttpErrorInterceptor])),
                provideHttpClientTesting(),
                { provide: ErrorMapperService, useValue: errorMapperSpy },
                { provide: GlobalErrorDispatcherService, useValue: dispatcherSpy }
            ]
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);

        errorMapperSpy.mapHttpError.calls.reset();
        dispatcherSpy.dispatch.calls.reset();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should catch HttpErrorResponse, map it, and dispatch to GlobalErrorDispatcher', fakeAsync(() => {
        // Arrange
        const mockHttpError = { status: 500, statusText: 'Server Error' };
        const mockAppError = new CriticalError('Error', 500, 'Dev', null);
        const testUrl = '/api/test';

        errorMapperSpy.mapHttpError.and.returnValue(mockAppError);

        // Act
        http.get(testUrl).subscribe({
            error: (err) => {                
                expect(err).toBe(mockAppError);
            }
        });

        const req = httpMock.expectOne(testUrl);
        req.flush({}, mockHttpError);
        tick();

        // Assert        
        expect(errorMapperSpy.mapHttpError).toHaveBeenCalled();
        expect(dispatcherSpy.dispatch).toHaveBeenCalledWith(mockAppError, testUrl);
    }));
});