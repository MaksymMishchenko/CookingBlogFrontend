import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthResponse, User } from "../components/interfaces";
import { catchError, Observable, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthErrorService } from "../../admin/shared/services/auth-error.service";

@Injectable({
    providedIn: 'root'
})

export class AuthService {

    private readonly AUTH_URL = environment.apiBaseUrl;

    constructor(private httpClient: HttpClient, private authErrorService: AuthErrorService) { }

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

    login(user: User): Observable<AuthResponse> {
        const url = `${this.AUTH_URL}/Login`;

        return this.httpClient.post<AuthResponse>(url, user).pipe(
            tap(response => this.setToken(response)),
            catchError(error => this.handleError(error))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        const errorMessage = error.error.message;
        this.authErrorService.emitError(errorMessage);

        return throwError(() => new Error)
    }

    logout(): void {
        this.removeTokens();
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    private setToken(response: AuthResponse): void {

        const payload = response.token.split('.')[1];
        const payloadData = JSON.parse(atob(payload));

        const expDate = new Date(payloadData.exp * 1000);

        localStorage.setItem('auth-token', response.token);
        localStorage.setItem('exp-token', expDate.toISOString());
    }

    private removeTokens(): void {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('exp-token');
    }
}