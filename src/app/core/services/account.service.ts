// src/app/core/services/account.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface AccountDTO {
  id: number;
  accountNumber: string;
  balance: number;
  userId: number;
}

@Injectable({providedIn: 'root'})
export class AccountService {
  private base = `${environment.apiGatewayUrl}/api/v1/accounts`;

  constructor(private http: HttpClient) {
  }

  getAllAccounts(): Observable<AccountDTO[]> {
    return this.http.get<AccountDTO[]>(this.base);
  }

  getAccountById(id: number): Observable<AccountDTO> {
    return this.http.get<AccountDTO>(`${this.base}/${id}`);
  }
}
