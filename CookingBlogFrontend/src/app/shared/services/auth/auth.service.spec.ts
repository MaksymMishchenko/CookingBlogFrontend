import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { AuthErrorService } from "../../../admin/shared/services/auth-error.service";
import { environment } from "../../../../environments/environment";
import { of } from "rxjs";
import { AuthResponse } from "../../components/interfaces";

// --- КОНСТАНТИ ДЛЯ ТЕСТУВАННЯ ---
const MOCK_USER = { userName: 'testuser', password: 'password123' };
// Токен з корисним навантаженням: {"exp": 1672511200} (це 2023-01-01T10:00:00.000Z)
const MOCK_TOKEN_PAYLOAD = 'eyJleHAiOjE2NzI1MTEyMDAwfQ';
const MOCK_TOKEN = `header.${MOCK_TOKEN_PAYLOAD}.signature`;
const MOCK_AUTH_RESPONSE = { token: MOCK_TOKEN };

describe('AuthService', () => {
    let authService: AuthService;
    let mockHttpClient: jasmine.SpyObj<HttpClient>;
    let mockAuthErrorService: jasmine.SpyObj<AuthErrorService>;
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
        // 1. Створення SpyObj для залежностей
        mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);
        mockAuthErrorService = jasmine.createSpyObj('AuthErrorService', ['emitError']);

        // 2. Налаштування мок-сховища (як у попередньому прикладі)
        mockLocalStorage = {};
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            mockLocalStorage[key] = value;
        });

        spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
            delete mockLocalStorage[key];
        });
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);

        authService = new AuthService(mockHttpClient, mockAuthErrorService);
    });

    describe('login(user)', () => {

        it('should call httpClient.post with correct endpoint and user data', (done) => {
            const expectedUrl = `${environment.apiBaseUrl}/Login`;

            // Налаштовуємо мок HttpClient, щоб він повертав успішну відповідь
            mockHttpClient.post.and.returnValue(of(MOCK_AUTH_RESPONSE));

            authService.login(MOCK_USER).subscribe({
                next: response => {
                    expect(response).toEqual(MOCK_AUTH_RESPONSE as AuthResponse) ;
                    done();
                }
            });

            // Перевіряємо, чи був викликаний HttpClient.post
            expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, MOCK_USER);
        });
    })
});