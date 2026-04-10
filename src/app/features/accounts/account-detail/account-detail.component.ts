import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatChipsModule} from '@angular/material/chips';

import {AccountDashboardResponse, AccountDTO, AccountService} from '../../../core/services/account.service';
import {AccountMonthlySummaryDTO, Page, TransactionDTO} from '../../../core/services/transaction.service';
import {ShortenPrefixPipe} from '../../../shorten-prefix.pipe';
import {MatMenuModule, MatMenuPanel, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    RouterLink,
    ShortenPrefixPipe,
    MatMenuTrigger,
    MatMenuModule,
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.scss'
})
export class AccountDetailComponent implements OnInit {
  account: AccountDTO | null = null;
  monthlySummary: AccountMonthlySummaryDTO | null = null;
  transactionPage: Page<TransactionDTO> | null = null;

  loading = true;      // covers the initial dashboard call
  loadingTxns = false; // covers pagination-only reloads
  error = '';
  txnError = '';

  currentPage = 0;
  readonly pageSize = 20;

  readonly columns = ['date', 'description', 'type', 'amount', 'balanceAfter'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.router.navigate(['/dashboard']);
      return;
    }
    this.loadDashboard(id, 0);
  }

  /**
   * Single call to the gateway aggregation endpoint.
   * On initial load, sets loading=true (shows full-page spinner).
   * On page changes, sets loadingTxns=true (keeps account header visible).
   */
  loadDashboard(accountId: number, page: number, paginationOnly = false): void {
    if (paginationOnly) {
      this.loadingTxns = true;
    } else {
      this.loading = true;
    }

    this.accountService.getDashboard(accountId, page, this.pageSize).subscribe({
      next: (res: AccountDashboardResponse) => {
        this.account = res.account;
        this.monthlySummary = res.monthlySummary;
        this.transactionPage = res.transactions;
        this.currentPage = page;
        this.loading = false;
        this.loadingTxns = false;
      },
      error: () => {
        if (paginationOnly) {
          this.txnError = 'Unable to load transactions.';
          this.loadingTxns = false;
        } else {
          this.error = 'Unable to load account.';
          this.loading = false;
        }
      }
    });
  }

  get accountId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  nextPage(): void {
    if (!this.transactionPage?.last) {
      this.loadDashboard(this.accountId, this.currentPage + 1, true);
    }
  }

  prevPage(): void {
    if (!this.transactionPage?.first) {
      this.loadDashboard(this.accountId, this.currentPage - 1, true);
    }
  }

  // ── Display helpers ───────────────────────────────────────────────────

  typeLabel(type: string): string {
    return ({
      TRANSFER: 'Transfer',
      DEPOSIT: 'Deposit',
      WITHDRAWAL: 'Withdrawal'
    } as Record<string, string>)[type] ?? type;
  }

  typeIcon(type: string): string {
    return ({
      TRANSFER: 'swap_horiz',
      DEPOSIT: 'arrow_downward',
      WITHDRAWAL: 'arrow_upward'
    } as Record<string, string>)[type] ?? 'receipt';
  }

  statusClass(status: string): string {
    return ({
      COMPLETED: 'status-completed',
      PENDING: 'status-pending',
      FAILED: 'status-failed',
      REVERSED: 'status-reversed'
    } as Record<string, string>)[status] ?? '';
  }

  /**
   * A transaction is a credit from this account's perspective when:
   * - It's a DEPOSIT (money always comes in)
   * - It's a TRANSFER and this account is the receiver
   */
  isCredit(txn: TransactionDTO): boolean {
    return txn.type === 'DEPOSIT' ||
      (txn.type === 'TRANSFER' && txn.toAccountId === this.account?.id);
  }

  private calculateMonthlySummary(transactions: TransactionDTO[]): void {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonth = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    this.monthlySummary = {
      month,
      totalDeposits: thisMonth
        .filter(t => t.type === 'DEPOSIT' ||
          (t.type === 'TRANSFER' && t.toAccountId === this.account?.id))
        .reduce((sum, t) => sum + Number(t.amount), 0),

      totalWithdrawals: thisMonth
        .filter(t => t.type === 'WITHDRAWAL' ||
          (t.type === 'TRANSFER' && t.fromAccountId === this.account?.id))
        .reduce((sum, t) => sum + Number(t.amount), 0)
    };
  }

  accountTypeLabel(type: string): string {
    return type?.replace(/_/g, ' ') ?? '';
  }

  protected moreMenu: MatMenuPanel | null | undefined;
}
