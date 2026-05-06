import { HttpClient, HttpContext } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { of } from "rxjs";
import { SingleApiResponse } from "../../interfaces/global.interface";
import { AuthData } from "../../interfaces/auth.interface";
import { ErrorHandlerService } from "../error/errorhandler.service";
import { AUTH_CLAIMS, STORAGE_KEYS } from "../../../core/constants/auth.constants";
import { AUTH_REDIRECT } from "../../../core/http/auth-context";
import { DEV_DESCRIPTIONS } from "../../../core/constants/dev-logs.constants";

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

        authService.userIdSignal.set(null);
        authService.currentUserSignal.set(null);
        (authService as any).tokenSignal.set(null);
        (authService as any).expSignal.set(null);
    });

    describe('Signals State & Context', () => {
        it('should initialize signals with values from localStorage', () => {
            // Arrange
            mockLocalStorage[STORAGE_KEYS.USER_NAME] = 'John';

            // Act
            const newService = new AuthService(mockHttpClient, mockErrorHandler);

            // Assert
            expect(newService.currentUserSignal()).toBe('John');
        });

        it('should update signals and use AUTH_REDIRECT context on login success', (done) => {
            // Arrange
            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));

            // Act
            authService.login(MOCK_USER).subscribe(() => {
                // Assert
                expect(authService.currentUserSignal()).toBe('admin');
                expect(authService.userIdSignal()).toBe('user-123');

                const args = mockHttpClient.post.calls.mostRecent().args;
                const context = args[2]?.context as HttpContext;
                expect(context.get(AUTH_REDIRECT)).toBeFalse();
                done();
            });
        });
    });

    describe('getUserRole()', () => {
        beforeEach(() => {
            authService.userIdSignal.set('test-user-id');
            (authService as any).expSignal.set(FUTURE_DATE_ISO);
        });

        it('should return "Admin" if role claim is "Admin"', () => {
            // Arrange
            const payload = { [AUTH_CLAIMS.ROLE]: 'Admin' };
            const token = `header.${btoa(JSON.stringify(payload))}.signature`;
            (authService as any).tokenSignal.set(token);

            // Act & Assert
            expect(authService.getUserRole()).toBe('Admin');
        });

        it('should return the first role if multiple roles exist and no Admin is present', () => {
            // Arrange
            const payload = { [AUTH_CLAIMS.ROLE]: ['Contributor', 'Viewer'] };
            const token = `header.${btoa(JSON.stringify(payload))}.signature`;
            (authService as any).tokenSignal.set(token);

            // Act & Assert
            expect(authService.getUserRole()).toBe('Contributor');
        });

        it('should call errorHandler and return null if decoding fails', () => {
            // Arrange            
            (authService as any).tokenSignal.set('this.is.invalid.token');
            (authService as any).expSignal.set(new Date(Date.now() + 10000).toISOString());

            // Act
            const result = authService.getUserRole();

            // Assert
            expect(result).toBeNull();
            expect(mockErrorHandler.logLogicError).toHaveBeenCalledWith(
                jasmine.any(Error),
                DEV_DESCRIPTIONS.AUTH_IDENTITY.JWT_DECODE_FAILED
            );
        });
    });

    describe('register()', () => {
        it('should call setToken and use AUTH_REDIRECT context on successful registration', (done) => {
            // Arrange
            const regResponse = { success: true, data: MOCK_AUTH_DATA };
            mockHttpClient.post.and.returnValue(of(regResponse));

            // Act
            authService.register({}).subscribe(() => {
                // Assert
                expect(authService.currentUserSignal()).toBe('admin');
                expect(mockLocalStorage[STORAGE_KEYS.AUTH_TOKEN]).toBe(MOCK_TOKEN);

                const args = mockHttpClient.post.calls.mostRecent().args;
                const context = args[2]?.context as HttpContext;
                expect(context.get(AUTH_REDIRECT)).toBeFalse();
                done();
            });
        });
    });

    describe('token getter', () => {
        it('should return null if token is expired', () => {
            // Arrange
            const EXPIRED_DATE = '2020-01-01T10:00:00.000Z';
            mockLocalStorage[STORAGE_KEYS.AUTH_TOKEN] = MOCK_TOKEN;
            mockLocalStorage[STORAGE_KEYS.EXP_TOKEN] = EXPIRED_DATE;

            // Act & Assert
            expect(authService.token).toBeNull();
        });
    });

    describe('isAuthenticated (Computed Signal)', () => {
        it('should be reactive and return true only when all conditions are met', () => {
            // Arrange & Act
            expect(authService.isAuthenticated()).toBeFalse();

            (authService as any).tokenSignal.set(MOCK_TOKEN);
            (authService as any).expSignal.set(FUTURE_DATE_ISO);

            // Assert
            expect(authService.isAuthenticated()).toBeFalse();

            authService.userIdSignal.set('123');
            expect(authService.isAuthenticated()).toBeTrue();
        });
    });

    describe('logout()', () => {
        it('should clear signals and localStorage', () => {
            // Arrange
            authService.currentUserSignal.set('admin');
            authService.userIdSignal.set('1');

            // Act
            authService.logout();

            // Assert
            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
            expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID);
            expect(authService.currentUserSignal()).toBeNull();
        });
    });
});