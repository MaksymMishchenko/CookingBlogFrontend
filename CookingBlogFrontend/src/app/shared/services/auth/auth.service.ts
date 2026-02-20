import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData, User } from "../../interfaces/auth.interface";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { AlertService } from "../alert/alert.service";
import { BaseService } from "../../../core/base/base-service";
import { API_ENDPOINTS } from "../../../core/constants/api-endpoints";
import { SingleApiResponse } from "../../interfaces/global.interface";

@Injectable({
    providedIn: 'root'
})

export class AuthService extends BaseService {

    constructor(
        protected override http: HttpClient,
        private alertService: AlertService
    ) {
        super(http);
    }

    private currentUserSubject = new BehaviorSubject<string | null>(localStorage.getItem('user-name'));
    public currentUser$ = this.currentUserSubject.asObservable();

    get token(): string | null {

        const authToken = localStorage.getItem('auth-token');
        const expTokenString = localStorage.getItem('exp-token');       

        if (!authToken || !expTokenString) {
            return null;
        }

        const expToken = new Date(expTokenString);

        if (new Date() > expToken) {
            this.logout();
            return null;
        }
        return authToken;
    }

    login(user: User): Observable<SingleApiResponse<{token: string}>> {
        const url = this.buildUrl(API_ENDPOINTS.AUTH.LOGIN);

        return this.http.post<SingleApiResponse<AuthData>>(url, user).pipe(           
            tap(response => {               
                if (response.success && response.data) {
                    this.setToken(response.data);
                }
            }),
            catchError(error => this.handleError(error))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        let errorMessage: string

        if (error.status === 401 || error.status === 403) {
            errorMessage = error.error.message

            this.alertService.emitInlineError(errorMessage);
        }

        return throwError(() => error)
    }

    logout(): void {
        this.removeTokens();
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    private setToken(data: AuthData): void {

        const payload = data.token.split('.')[1];
        const payloadData = JSON.parse(atob(payload));

        const expDate = new Date(payloadData.exp * 1000);

        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('exp-token', expDate.toISOString());
        localStorage.setItem('user-name', data.userName);

        this.currentUserSubject.next(data.userName);
    }

    private removeTokens(): void {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('exp-token');
        localStorage.removeItem('user-name');

        this.currentUserSubject.next(null);
    }
}