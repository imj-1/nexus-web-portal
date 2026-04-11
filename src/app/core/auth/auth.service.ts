import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private base = `${environment.apiGatewayUrl}/api/v1/auth`;

  constructor(private http: HttpClient, private router: Router) {
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        localStorage.setItem('expires_in', String(res.expires_in));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    this.router.navigate(['/']);
  }

  refresh(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<LoginResponse>(`${this.base}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(res => this.storeTokens(res))
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  private storeTokens(res: LoginResponse): void {
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    localStorage.setItem('expires_in', String(res.expires_in));
  }
}
