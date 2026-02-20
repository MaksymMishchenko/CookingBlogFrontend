import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { environment } from "../../../../environments/environment";
import { of, throwError } from "rxjs";
import { AlertService } from "../alert/alert.service";
import { SingleApiResponse } from "../../interfaces/global.interface";
import { AuthData } from "../../interfaces/auth.interface";

const MOCK_USER = { userName: 'testuser', password: 'password123' };
const MOCK_TOKEN_PAYLOAD = 'eyJleHAiOjE2NzI1MTEyMDAwfQ';
const MOCK_TOKEN = `header.${MOCK_TOKEN_PAYLOAD}.signature`;

const MOCK_AUTH_DATA = { token: MOCK_TOKEN, userName: 'admin' };

const MOCK_API_RESPONSE_SUCCESS: SingleApiResponse<AuthData> = {
    data: MOCK_AUTH_DATA,
    success: true,
    message: 'Login successful'
};

const MOCK_API_RESPONSE_FAILED: SingleApiResponse<{ token: string }> = {
    data: null,
    success: false,
    message: 'Invalid credentials',
};

const FUTURE_DATE_ISO = '3000-01-01T10:00:00.000Z';

describe('AuthService', () => {
    let authService: AuthService;
    let mockHttpClient: jasmine.SpyObj<HttpClient>;
    let mockAlertService: jasmine.SpyObj<AlertService>;
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
        mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);
        mockAlertService = jasmine.createSpyObj('AlertService', ['emitInlineError']);

        mockLocalStorage = {};
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            mockLocalStorage[key] = value;
        });

        spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
            delete mockLocalStorage[key];
        });
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);

        authService = new AuthService(mockHttpClient, mockAlertService);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe('login(user)', () => {

        it('should NOT call setToken and NOT save tokens if success is false', (done) => {
            const setTokenSpy = spyOn<any>(authService, 'setToken').and.callThrough();

            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_FAILED));

            authService.login(MOCK_USER).subscribe({
                next: (response) => {
                    expect(response.success).toBeFalse();
                    expect(response.message).toBe('Invalid credentials');
                    expect(setTokenSpy).not.toHaveBeenCalled();
                    expect(localStorage.setItem).not.toHaveBeenCalledWith('auth-token', jasmine.any(String));
                    done();
                }
            });
        });

        it('should call httpClient.post with correct endpoint and user data', (done) => {
            const expectedUrl = `${environment.apiUrl}/auth/login`;

            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));

            authService.login(MOCK_USER).subscribe({
                next: response => {
                    expect(response.success).toBeTrue();
                    expect(response.message).toBe('Login successful');
                    expect(response.data!.token).toBe(MOCK_TOKEN);
                    done();
                }
            });

            expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, MOCK_USER);
        });

        it('should call setToken and save tokens to localStorage on success', (done) => {
            const setTokenSpy = spyOn<any>(authService, 'setToken').and.callThrough();

            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));

            authService.login(MOCK_USER).subscribe({
                next: () => {
                    expect(setTokenSpy).toHaveBeenCalledWith(MOCK_AUTH_DATA);
                    expect(localStorage.setItem).toHaveBeenCalledWith('auth-token', MOCK_TOKEN);
                    done();
                }
            });
        });

        it('should update currentUserSubject on successful login', (done) => {
            mockHttpClient.post.and.returnValue(of(MOCK_API_RESPONSE_SUCCESS));

            authService.login(MOCK_USER).subscribe({
                next: () => {
                    authService.currentUser$.subscribe(userName => {
                        expect(userName).toBe('admin');
                        expect(localStorage.setItem).toHaveBeenCalledWith('user-name', 'admin');
                        done();
                    });
                }
            });
        });

        it('should call handleError on HTTP failure', (done) => {
            const errorResponse = { error: { message: 'Invalid credentials' } } as HttpErrorResponse;

            mockHttpClient.post.and.returnValue(throwError(() => errorResponse));

            const handleErrorSpy = spyOn<any>(authService, 'handleError').and.returnValue(
                throwError(() => errorResponse)
            );

            authService.login(MOCK_USER).subscribe({
                error: (err) => {
                    expect(handleErrorSpy).toHaveBeenCalledWith(errorResponse);
                    expect(localStorage.setItem).not.toHaveBeenCalled();
                    expect(err).toEqual(errorResponse);
                    done();
                }
            });
        });
    })

    describe('token getter', () => {

        it('should return NULL if auth-token or exp-token is missing', () => {
            expect(authService.token).toBeNull();

            localStorage.setItem('auth-token', MOCK_TOKEN);
            expect(authService.token).toBeNull();
        });

        it('should return the token if it is NOT expired', () => {
            localStorage.setItem('auth-token', MOCK_TOKEN);
            localStorage.setItem('exp-token', FUTURE_DATE_ISO);

            expect(authService.token).toEqual(MOCK_TOKEN);
        });

        it('should call logout and return NULL if the token IS expired', () => {
            jasmine.clock().install();
            const now = new Date(2025, 1, 1, 10, 0, 0);
            jasmine.clock().mockDate(now);

            const EXPIRED_DATE_ISO = '2025-01-01T10:00:00.000Z';
            localStorage.setItem('auth-token', MOCK_TOKEN);
            localStorage.setItem('exp-token', EXPIRED_DATE_ISO);

            const logoutSpy = spyOn(authService, 'logout').and.callThrough();

            const result = authService.token;

            expect(logoutSpy).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(localStorage.getItem('auth-token')).toBeNull();
        });
    });

    describe('logout()', () => {
        it('should remove auth and exp tokens from localStorage', () => {
            localStorage.setItem('auth-token', MOCK_TOKEN);
            localStorage.setItem('exp-token', FUTURE_DATE_ISO);

            authService.logout();

            expect(localStorage.removeItem).toHaveBeenCalledWith('auth-token');
            expect(localStorage.removeItem).toHaveBeenCalledWith('exp-token');

            expect(mockLocalStorage['auth-token']).toBeUndefined();
        });
    });

    describe('isAuthenticated()', () => {
        let tokenSpy: jasmine.Spy;

        beforeEach(() => {
            tokenSpy = spyOnProperty(authService, 'token', 'get');
        });

        it('should return TRUE if token getter returns a value', () => {
            tokenSpy.and.returnValue(MOCK_TOKEN);
            expect(authService.isAuthenticated()).toBeTrue();
        });

        it('should return FALSE if token getter returns NULL', () => {
            tokenSpy.and.returnValue(null);
            expect(authService.isAuthenticated()).toBeFalse();
        });
    });
});