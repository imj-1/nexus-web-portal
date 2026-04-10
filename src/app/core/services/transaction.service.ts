import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface TransactionDTO {
  id: number;
  transactionReference: string;
  fromAccountId: number | null;
  toAccountId: number | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  /** Running balance of the queried account after this transaction settled. */
  balanceAfter: number | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface AccountMonthlySummaryDTO {
  month: string;
  totalDeposits: number;
  totalWithdrawals: number;
}

@Injectable({providedIn: 'root'})
export class TransactionService {
  private base = `${environment.apiGatewayUrl}/api/v1/transactions`;

  constructor(private http: HttpClient) {
  }

  getByAccountId(accountId: number, page = 0, size = 20): Observable<Page<TransactionDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');

    return this.http.get<Page<TransactionDTO>>(
      `${this.base}/account/${accountId}`, {params}
    );
  }

  /**
   * Fetches deposit + withdrawal totals for the current calendar month.
   * Called by the dashboard to populate per-account stat chips.
   */
  getMonthlySummary(accountId: number): Observable<AccountMonthlySummaryDTO> {
    return this.http.get<AccountMonthlySummaryDTO>(
      `${this.base}/account/${accountId}/summary`
    );
  }
}
