import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiServiceAuthResponse, User } from '../../shared/interfaces';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7030/api/auth';

  constructor(private http: HttpClient) { }

  login(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(tap(this.saveToken));
  }

  logout() {
    this.saveToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveToken(response: ApiServiceAuthResponse | null): void {
    if (response) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('exp-token', response.expires);
    }
    else {
      localStorage.clear();
    }
  }

  getToken(): string | null {
    const expDate = new Date(localStorage.getItem('exp-token'))
    if (new Date() > expDate) {
      this.logout()
      return null;
    }
    return localStorage.getItem('authToken');
  }
}
