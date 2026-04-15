import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AccountMonthlySummaryDTO, Page, TransactionDTO} from './transaction.service';
import {KeycloakService} from 'keycloak-angular';
import {switchMap} from 'rxjs/operators';

export interface AccountDTO {
  id: number;
  accountNumber: string;
  accountType: 'CHECKING' | 'BASIC_SAVINGS' | 'HIGH_YIELD_SAVINGS' | 'CERTIFICATE_OF_DEPOSIT' | 'MONEY_MARKET';
  balance: number;           // presentBalance (settled ledger)
  availableBalance: number;  // balance minus holds
  userId: string;
}

export interface AccountDashboardResponse {
  account: AccountDTO;
  monthlySummary: AccountMonthlySummaryDTO;
  transactions: Page<TransactionDTO>;
}

export interface CreateAccountRequest {
  initialBalance: number;
  accountType: 'CHECKING' | 'BASIC_SAVINGS' | 'HIGH_YIELD_SAVINGS' | 'CERTIFICATE_OF_DEPOSIT' | 'MONEY_MARKET';
}

@Injectable({providedIn: 'root'})
export class AccountService {
  private base = `${environment.apiGatewayUrl}/api/v1/accounts`;

  constructor(
    private http: HttpClient,
    private keycloak: KeycloakService
  ) {}

  createAccount(request: CreateAccountRequest): Observable<AccountDTO> {
    return from(this.keycloak.updateToken(60)).pipe(
      switchMap(() => this.http.post<AccountDTO>(this.base, request))
    );
  }

  getAllAccounts(): Observable<AccountDTO[]> {
    return from(this.keycloak.updateToken(60)).pipe(
      switchMap(() => this.http.get<AccountDTO[]>(this.base))
    );
  }

  getAccountById(id: number): Observable<AccountDTO> {
    return this.http.get<AccountDTO>(`${this.base}/${id}`);
  }

  /**
   * Single aggregated call to the gateway's /dashboard endpoint.
   * Returns account details, monthly summary, and paginated transactions in one shot.
   */
  getDashboard(
    accountId: number,
    page = 0,
    size = 20
  ): Observable<AccountDashboardResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<AccountDashboardResponse>(
      `${this.base}/${accountId}/dashboard`, {params}
    );
  }
}
