import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AccountMonthlySummaryDTO, Page, TransactionDTO} from './transaction.service';

export interface AccountDTO {
  id: number;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET';
  balance: number;           // presentBalance (settled ledger)
  availableBalance: number;  // balance minus holds
  userId: string;
}

export interface AccountDashboardResponse {
  account: AccountDTO;
  monthlySummary: AccountMonthlySummaryDTO;
  transactions: Page<TransactionDTO>;
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

  /**
   * Single aggregated call to the gateway's /dashboard endpoint.
   * Returns account details, monthly summary, and paginated transactions in one shot.
   */
  getDashboard(accountId: number, page = 0, size = 20): Observable<AccountDashboardResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<AccountDashboardResponse>(
      `${this.base}/${accountId}/dashboard`, {params}
    );
  }
}
