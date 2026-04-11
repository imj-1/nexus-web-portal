import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
}

@Injectable({providedIn: 'root'})
export class UserService {
  private base = `${environment.apiGatewayUrl}/api/v1/auth`;

  constructor(private http: HttpClient) {
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.base}/register`, payload);
  }
}
