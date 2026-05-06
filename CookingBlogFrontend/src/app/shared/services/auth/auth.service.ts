import { HttpClient, HttpContext } from "@angular/common/http";
import { computed, Injectable, signal } from "@angular/core";
import { AuthData, User } from "../../interfaces/auth.interface";
import { Observable, tap } from "rxjs";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import { SingleApiResponse } from "../../interfaces/global.interface";
import { ErrorHandlerService } from "../error/errorhandler.service";
import { AUTH_CLAIMS, AUTH_ROLES, STORAGE_KEYS } from "../../../core/constants/auth.constants";
import { AUTH_REDIRECT } from "../../../core/http/auth-context";
import { DEV_DESCRIPTIONS } from "../../../core/constants/dev-logs.constants";

@Injectable({
    providedIn: 'root'
})

export class AuthService extends BaseService {
    public userIdSignal = signal<string | null>(localStorage.getItem(STORAGE_KEYS.USER_ID));
    public currentUserSignal = signal<string | null>(localStorage.getItem(STORAGE_KEYS.USER_NAME));
    private tokenSignal = signal<string | null>(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
    private expSignal = signal<string | null>(localStorage.getItem(STORAGE_KEYS.EXP_TOKEN));

    public isAuthenticated = computed(() => {
        const id = this.userIdSignal();
        const token = this.tokenSignal();
        const exp = this.expSignal();

        if (!id || !token || !exp) return false;

        return new Date() <= new Date(exp);
    });

    constructor(
        protected override http: HttpClient,
        private errorHandler: ErrorHandlerService
    ) {
        super(http);
        this.errorHandler = errorHandler;
    }

    get token(): string | null {
        if (!this.isAuthenticated()) return null;
        return this.tokenSignal();
    }

    login(user: User): Observable<SingleApiResponse<AuthData>> {
        const url = this.buildUrl(API_ENDPOINTS.AUTH.LOGIN);

        return this.http.post<SingleApiResponse<AuthData>>(url, user, {
            context: new HttpContext().set(AUTH_REDIRECT, false)
        }).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.setToken(response.data);
                }
            })
        );
    }

    getUserRole(): string | null {
        const token = this.token;
        if (!token) return null;

        try {
            // TODO: Replace manual atob decoding with 'jwt-decode' library for better resilience.
            // Reference: https://github.com/MaksymMishchenko/CookingBlogFrontend/issues/34
            const payload = token.split('.')[1];

            // TODO: Implement 'DecodedTokenPayload' interface to replace 'any' and ensure type safety.
            // Reference: https://github.com/MaksymMishchenko/CookingBlogFrontend/issues/34
            const decodedPayload = JSON.parse(atob(payload));
            const roles = decodedPayload[AUTH_CLAIMS.ROLE] || decodedPayload[AUTH_CLAIMS.SHORT_ROLE];

            if (Array.isArray(roles)) {
                return roles.includes(AUTH_ROLES.ADMIN) ? AUTH_ROLES.ADMIN : roles[0];
            }

            return roles || null;
        } catch (e) {
            this.errorHandler.logLogicError(e, DEV_DESCRIPTIONS.AUTH_IDENTITY.JWT_DECODE_FAILED);
            return null;
        }
    }

    register(userData: any): Observable<any> {
        const url = this.buildUrl(API_ENDPOINTS.AUTH.REGISTER);
        return this.http.post<any>(url, userData, {
            context: new HttpContext().set(AUTH_REDIRECT, false)
        }).pipe(
            tap(response => {
                if (response.success && response.data?.token) {
                    this.setToken(response.data);
                }
            })
        );
    }

    logout(): void {
        this.removeTokens();
    }

    private setToken(data: AuthData): void {
        const payload = data.token.split('.')[1];
        const payloadData = JSON.parse(atob(payload));

        const userId = payloadData[AUTH_CLAIMS.NAME_IDENTIFIER];
        const expDate = new Date(payloadData.exp * 1000);
        const expIso = expDate.toISOString();

        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.EXP_TOKEN, expIso);
        localStorage.setItem(STORAGE_KEYS.USER_NAME, data.userName);
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);

        this.tokenSignal.set(data.token);
        this.expSignal.set(expIso);
        this.currentUserSignal.set(data.userName);
        this.userIdSignal.set(userId);
    }

    private removeTokens(): void {
        localStorage.removeItem(STORAGE_KEYS.EXP_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);

        this.tokenSignal.set(null);
        this.expSignal.set(null);
        this.currentUserSignal.set(null);
        this.userIdSignal.set(null);
    }
}