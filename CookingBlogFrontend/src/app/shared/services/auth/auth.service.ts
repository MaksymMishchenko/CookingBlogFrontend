import { HttpClient, HttpContext } from "@angular/common/http";
import { computed, Injectable, signal } from "@angular/core";
import { AuthData, User } from "../../interfaces/auth.interface";
import { Observable, tap } from "rxjs";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import { SingleApiResponse } from "../../interfaces/global.interface";
import { SKIP_GLOBAL_ERROR } from "../../../core/http/http-context-token";

@Injectable({
    providedIn: 'root'
})

export class AuthService extends BaseService {
    private readonly CLR_NAME_IDENTIFIER = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

    public userIdSignal = signal<string | null>(localStorage.getItem('user-id'));
    public currentUserSignal = signal<string | null>(localStorage.getItem('user-name'));
    private tokenSignal = signal<string | null>(localStorage.getItem('auth-token'));

    //public isAuthenticated = computed(() => !!this.userIdSignal() && !!this.token);

    public isAuthenticated = computed(() => {
        const id = this.userIdSignal();
        const token = this.tokenSignal();
        const exp = localStorage.getItem('exp-token');

        if (!id || !token || !exp) return false;

        return new Date() <= new Date(exp);
    });

    constructor(
        protected override http: HttpClient,
    ) {
        super(http);
    }

    get token(): string | null {
        return this.tokenSignal();
    }

    login(user: User, context?: HttpContext): Observable<SingleApiResponse<AuthData>> {
        const url = this.buildUrl(API_ENDPOINTS.AUTH.LOGIN);

        const httpContext = context ?? new HttpContext();

        if (!httpContext.has(SKIP_GLOBAL_ERROR)) {
            httpContext.set(SKIP_GLOBAL_ERROR, true);
        }

        return this.http.post<SingleApiResponse<AuthData>>(url, user, {
            context: httpContext
        }).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.setToken(response.data);
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        const url = this.buildUrl(API_ENDPOINTS.AUTH.REGISTER);
        return this.http.post<any>(url, userData, {
            context: new HttpContext().set(SKIP_GLOBAL_ERROR, true)
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

        const userId = payloadData[this.CLR_NAME_IDENTIFIER];
        const expDate = new Date(payloadData.exp * 1000);

        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('exp-token', expDate.toISOString());
        localStorage.setItem('user-name', data.userName);
        localStorage.setItem('user-id', userId);

        this.tokenSignal.set(data.token);
        this.currentUserSignal.set(data.userName);
        this.userIdSignal.set(userId);
    }

    private removeTokens(): void {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('exp-token');
        localStorage.removeItem('user-name');
        localStorage.removeItem('user-id');

        this.tokenSignal.set(null);
        this.currentUserSignal.set(null);
        this.userIdSignal.set(null);
    }
}