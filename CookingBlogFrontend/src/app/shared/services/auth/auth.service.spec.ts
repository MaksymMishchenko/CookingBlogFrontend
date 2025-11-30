import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { environment } from "../../../../environments/environment";
import { of, throwError } from "rxjs";
import { AuthResponse } from "../../interfaces/auth.interface";
import { AlertService } from "../alert/alert.service";

const MOCK_USER = { userName: 'testuser', password: 'password123' };
const MOCK_TOKEN_PAYLOAD = 'eyJleHAiOjE2NzI1MTEyMDAwfQ';
const MOCK_TOKEN = `header.${MOCK_TOKEN_PAYLOAD}.signature`;
const MOCK_AUTH_RESPONSE = { token: MOCK_TOKEN };
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

        it('should call httpClient.post with correct endpoint and user data', (done) => {
            // Arrange
            const expectedUrl = `${environment.apiBaseUrl}/Login`;

            mockHttpClient.post.and.returnValue(of(MOCK_AUTH_RESPONSE));

            // Act
            authService.login(MOCK_USER).subscribe({
                next: response => {
                    expect(response).toEqual(MOCK_AUTH_RESPONSE as AuthResponse);
                    done();
                }
            });

            // Assert
            expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, MOCK_USER);
        });

        it('should call setToken and save tokens to localStorage on success', (done) => {
            // Arrange
            const setTokenSpy = spyOn<any>(authService, 'setToken').and.callThrough();

            mockHttpClient.post.and.returnValue(of(MOCK_AUTH_RESPONSE));

            // Act & Assert
            authService.login(MOCK_USER).subscribe({
                next: () => {
                    expect(setTokenSpy).toHaveBeenCalledWith(MOCK_AUTH_RESPONSE);
                    expect(localStorage.setItem).toHaveBeenCalledWith('auth-token', MOCK_TOKEN);

                    const expectedExpiryDate = '2499-12-30T16:26:40.000Z';

                    expect(localStorage.setItem).toHaveBeenCalledWith('exp-token', expectedExpiryDate);
                    done();
                }
            });
        });

        it('should call handleError on HTTP failure', (done) => {
            // Arrange
            const errorResponse = { error: { message: 'Invalid credentials' } } as HttpErrorResponse;

            mockHttpClient.post.and.returnValue(throwError(() => errorResponse));

            const handleErrorSpy = spyOn<any>(authService, 'handleError').and.returnValue(
                throwError(() => errorResponse)
            );

            // Act & Assert
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
            // Act and Assert
            expect(authService.token).toBeNull();

            localStorage.setItem('auth-token', MOCK_TOKEN);
            expect(authService.token).toBeNull();
        });

        it('should return the token if it is NOT expired', () => {
            // Arrange
            localStorage.setItem('auth-token', MOCK_TOKEN);
            localStorage.setItem('exp-token', FUTURE_DATE_ISO);

            // Act
            const result = authService.token;

            // Assert
            expect(result).toEqual(MOCK_TOKEN);
        });

        it('should call logout and return NULL if the token IS expired', () => {
            // Arrange
            jasmine.clock().install();
            const now = new Date(2025, 1, 1, 10, 0, 0);
            jasmine.clock().mockDate(now);

            const EXPIRED_DATE_ISO = '2025-01-01T10:00:00.000Z';
            localStorage.setItem('auth-token', MOCK_TOKEN);
            localStorage.setItem('exp-token', EXPIRED_DATE_ISO);

            const logoutSpy = spyOn(authService, 'logout').and.callThrough();

            // Act
            const result = authService.token;

            // Assert
            expect(logoutSpy).toHaveBeenCalled();
            expect(result).toBeNull();
            expect(localStorage.getItem('auth-token')).toBeNull();
        });
    });

    describe('logout()', () => {
        it('should remove auth and exp tokens from localStorage', () => {
            // Arrange
            localStorage.setItem('auth-token', MOCK_TOKEN);
            localStorage.setItem('exp-token', FUTURE_DATE_ISO);

            // Act
            authService.logout();

            // Assert
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
            // Arrange
            tokenSpy.and.returnValue(MOCK_TOKEN);

            // Act
            const result = authService.isAuthenticated();

            // Assert
            expect(result).toBeTrue();
        });

        it('should return FALSE if token getter returns NULL', () => {
            // Arrange
            tokenSpy.and.returnValue(null);

            // Act
            const result = authService.isAuthenticated();

            // Assert
            expect(result).toBeFalse();
        });

    });
    
});