import { HttpClient, HttpContext } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { of } from "rxjs";
import { SingleApiResponse } from "../../interfaces/global.interface";
import { AuthData } from "../../interfaces/auth.interface";
import { SKIP_GLOBAL_ERROR } from "../../../core/http/http-context-token";
import { ErrorHandlerService } from "../error/errorhandler.service";
import { AUTH_CLAIMS, STORAGE_KEYS } from "../../../core/constants/auth.constants";

const MOCK_USER = { userName: 'testuser', password: 'password123' };
const payloadObj = {
    [AUTH_CLAIMS.NAME_IDENTIFIER]: 'user-123',
    exp: Math.floor(Date.now() / 1000) + 3600
};

const MOCK_TOKEN_PAYLOAD = btoa(JSON.stringify(payloadObj));
const MOCK_TOKEN = `header.${MOCK_TOKEN_PAYLOAD}.signature`;

const MOCK_AUTH_DATA: AuthData = { token: MOCK_TOKEN, userName: 'admin' };

const MOCK_API_RESPONSE_SUCCESS: SingleApiResponse<AuthData> = {
    data: MOCK_AUTH_DATA,
    success: true,
    message: 'Login successful'
};

const FUTURE_DATE_ISO = '3000-01-01T10:00:00.000Z';

describe('AuthService', () => {
    let authService: AuthService;
    let mockHttpClient: jasmine.SpyObj<HttpClient>;
    let mockErrorHandler: jasmine.SpyObj<ErrorHandlerService>;
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
        mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);
        mockErrorHandler = jasmine.createSpyObj('ErrorHandlerService', ['logLogicError']);
        mockLocalStorage = {};

        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            mockLocalStorage[key] = value;
        });

        spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
            delete mockLocalStorage[key];
        });
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);

        authService = new AuthService(mockHttpClient, mockErrorHandler);
    });

    describe('Signals State & Context', () => {
        it('should initialize signals with values from localStorage', () => {
            mockLocalStorage[STORAGE_KEYS.USER_NAME] = 'John';
            const newService = new AuthService(mockHttpClient, mockErrorHandler);
            expect(newService.currentUserSignal()).toBe('John');
        });

        it('should set SKIP_GLOBAL_ERROR to true in HttpContext if not provided in login()', () => {
            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));

            authService.login(MOCK_USER).subscribe();

            const callArgs = mockHttpClient.post.calls.mostRecent().args[2];
            const context = callArgs?.context as HttpContext;

            expect(context.get(SKIP_GLOBAL_ERROR)).toBeTrue();
        });

        it('should preserve existing context values and add SKIP_GLOBAL_ERROR', () => {
            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));
            const customContext = new HttpContext();

            authService.login(MOCK_USER, customContext).subscribe();

            const context = mockHttpClient.post.calls.mostRecent().args[2]?.context as HttpContext;
            expect(context.get(SKIP_GLOBAL_ERROR)).toBeTrue();
        });

        it('should update signals on login success', (done) => {
            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));

            authService.login(MOCK_USER).subscribe(() => {
                expect(authService.currentUserSignal()).toBe('admin');
                expect(authService.userIdSignal()).toBe('user-123');
                done();
            });
        });
    });

    describe('getUserRole()', () => {
        it('should return "Admin" if role claim is "Admin"', () => {
            const payload = { [AUTH_CLAIMS.ROLE]: 'Admin' };
            const token = `header.${btoa(JSON.stringify(payload))}.signature`;

            (authService as any).tokenSignal.set(token);

            expect(authService.getUserRole()).toBe('Admin');
        });

        it('should return the first role if multiple and no Admin', () => {
            const payload = { 'role': ['Contributor', 'Viewer'] };
            const token = `header.${btoa(JSON.stringify(payload))}.signature`;

            (authService as any).tokenSignal.set(token);

            expect(authService.getUserRole()).toBe('Contributor');
        });

        it('should call errorHandler and return null if decoding fails', () => {
            (authService as any).tokenSignal.set('invalid.token.here');

            const result = authService.getUserRole();

            expect(result).toBeNull();
            expect(mockErrorHandler.logLogicError).toHaveBeenCalled();
        });
    });

    describe('register()', () => {
        it('should call setToken and update state on successful registration', (done) => {
            const regResponse = { success: true, data: MOCK_AUTH_DATA };
            mockHttpClient.post.and.returnValue(of(regResponse));

            authService.register({}).subscribe(() => {
                expect(authService.currentUserSignal()).toBe('admin');
                expect(mockLocalStorage['auth-token']).toBe(MOCK_TOKEN);
                done();
            });
        });

        it('should always set SKIP_GLOBAL_ERROR to true in register()', () => {
            mockHttpClient.post.and.returnValue(of({ success: true }));

            authService.register({}).subscribe();

            const context = mockHttpClient.post.calls.mostRecent().args[2]?.context as HttpContext;
            expect(context.get(SKIP_GLOBAL_ERROR)).toBeTrue();
        });
    });

    describe('token getter (Pure Implementation)', () => {
        it('should return null if token is expired', () => {
            const EXPIRED_DATE = '2020-01-01T10:00:00.000Z';
            mockLocalStorage['auth-token'] = MOCK_TOKEN;
            mockLocalStorage['exp-token'] = EXPIRED_DATE;

            expect(authService.token).toBeNull();
        });
    });

    describe('isAuthenticated (Computed Signal)', () => {
        it('should be reactive and return true only when all conditions are met', () => {
            expect(authService.isAuthenticated()).toBeFalse();

            (authService as any).tokenSignal.set(MOCK_TOKEN);
            (authService as any).expSignal.set(FUTURE_DATE_ISO);

            expect(authService.isAuthenticated()).toBeFalse();

            authService.userIdSignal.set('123');
            expect(authService.isAuthenticated()).toBeTrue();
        });
    });

    describe('logout()', () => {
        it('should clear signals and localStorage', () => {
            authService.currentUserSignal.set('admin');
            authService.userIdSignal.set('1');

            authService.logout();            

            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID);
            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.EXP_TOKEN);
            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_NAME);
        });
    });    
});