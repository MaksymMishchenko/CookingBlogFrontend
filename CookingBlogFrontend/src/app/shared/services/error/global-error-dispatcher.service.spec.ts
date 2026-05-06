import { TestBed } from '@angular/core/testing';
import { GlobalErrorDispatcherService } from './global-error-dispatcher.service';
import { AlertService } from '../../../shared/services/alert/alert.service';
import { ErrorHandlerService } from './errorhandler.service';
import { ValidationError, BusinessError, CriticalError } from './error.types';
import { BACKEND_ERROR_CODES } from './error-codes';
import { ADMIN_ROUTER_PATHS } from '../../../core/constants/api-endpoints';

describe('GlobalErrorDispatcherService', () => {
    let service: GlobalErrorDispatcherService;
    let alertServiceSpy: jasmine.SpyObj<AlertService>;
    let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

    beforeEach(() => {
        const aSpy = jasmine.createSpyObj('AlertService', ['error', 'warning']);
        const eSpy = jasmine.createSpyObj('ErrorHandlerService', ['logAppError']);

        TestBed.configureTestingModule({
            providers: [
                GlobalErrorDispatcherService,
                { provide: AlertService, useValue: aSpy },
                { provide: ErrorHandlerService, useValue: eSpy }
            ]
        });

        service = TestBed.inject(GlobalErrorDispatcherService);
        alertServiceSpy = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
        errorHandlerSpy = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
    });

    it('should always log the error via ErrorHandlerService', () => {
        const error = new CriticalError(
            'Test User Message',
            500,
            'Internal technical details',
            null,
            'INTERNAL_SERVER_ERROR'
        );

        service.dispatch(error, '/any-url');

        expect(errorHandlerSpy.logAppError).toHaveBeenCalledWith(error);
    });

    describe('Validation Errors', () => {
        it('should show warning alert when post content is empty', () => {
            const error = new ValidationError('Empty content', 400, 'dev log', {} as any, {}, BACKEND_ERROR_CODES.POST.CONTENT_EMPTY);

            service.dispatch(error, '/any-url');

            expect(alertServiceSpy.warning).toHaveBeenCalledWith('Empty content');
        });

        it('should NOT show alert for unknown validation codes', () => {
            const error = new ValidationError('Other validation', 400, 'dev log', {} as any, {}, 'UNKNOWN_CODE');

            service.dispatch(error, '/any-url');

            expect(alertServiceSpy.warning).not.toHaveBeenCalled();
        });
    });

    describe('Business Errors', () => {
        const url = `/${ADMIN_ROUTER_PATHS.ADMIN}/posts`;

        it('should show error alert for POST_NOT_FOUND in ADMIN context', () => {
            const error = new BusinessError('Not Found', 404, 'log', {} as any, BACKEND_ERROR_CODES.POST.NOT_FOUND);

            service.dispatch(error, url);

            expect(alertServiceSpy.error).toHaveBeenCalledWith('Not Found');
        });

        it('should NOT show alert for POST_NOT_FOUND in non-admin context', () => {
            const error = new BusinessError('Not Found', 404, 'log', {} as any, BACKEND_ERROR_CODES.POST.NOT_FOUND);

            service.dispatch(error, '/public/recipes');

            expect(alertServiceSpy.error).not.toHaveBeenCalled();
        });
    });

    describe('Critical & Infrastructure Errors', () => {
        it('should show error alert with userMessage for CriticalError', () => {
            const error = new CriticalError('Public Msg', 500, 'Internal Log', {} as any);

            service.dispatch(error, '/any-url');

            expect(alertServiceSpy.error).toHaveBeenCalledWith('Public Msg');
        });
    });
});