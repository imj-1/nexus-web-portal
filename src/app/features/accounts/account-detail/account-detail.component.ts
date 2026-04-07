import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatChipsModule} from '@angular/material/chips';
import {AccountDTO, AccountService} from '../../../core/services/account.service';
import {Page, TransactionDTO, TransactionService} from '../../../core/services/transaction.service';

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
    RouterLink
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.scss'
})
export class AccountDetailComponent implements OnInit {
  account: AccountDTO | null = null;
  transactionPage: Page<TransactionDTO> | null = null;
  loadingAccount = true;
  loadingTxns = true;
  accountError = '';
  txnError = '';
  currentPage = 0;
  readonly pageSize = 20;

  readonly columns = [
    'reference', 'type', 'amount', 'status', 'description', 'date'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.accountService.getAccountById(id).subscribe({
      next: a => {
        this.account = a;
        this.loadingAccount = false;
      },
      error: () => {
        this.accountError = 'Unable to load account.';
        this.loadingAccount = false;
      }
    });

    this.loadTransactions(id, 0);
  }

  loadTransactions(accountId: number, page: number): void {
    this.loadingTxns = true;
    this.transactionService.getByAccountId(accountId, page, this.pageSize).subscribe({
      next: p => {
        this.transactionPage = p;
        this.currentPage = page;
        this.loadingTxns = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.transactionPage = {
            content: [],
            totalPages: 0,
            totalElements: 0,
            number: 0,
            size: this.pageSize,
            first: true,
            last: true
          };
        } else {
          this.txnError = 'Unable to load transactions.';
        }
        this.loadingTxns = false;
      }
    });
  }

  get accountId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  nextPage(): void {
    if (!this.transactionPage?.last) {
      this.loadTransactions(this.accountId, this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (!this.transactionPage?.first) {
      this.loadTransactions(this.accountId, this.currentPage - 1);
    }
  }

  typeLabel(type: string): string {
    return {TRANSFER: 'Transfer', DEPOSIT: 'Deposit', WITHDRAWAL: 'Withdrawal'}[type] ?? type;
  }

  typeIcon(type: string): string {
    return {TRANSFER: 'swap_horiz', DEPOSIT: 'arrow_downward', WITHDRAWAL: 'arrow_upward'}[type] ?? 'receipt';
  }

  statusClass(status: string): string {
    return {
      COMPLETED: 'status-completed',
      PENDING: 'status-pending',
      FAILED: 'status-failed',
      REVERSED: 'status-reversed'
    }[status] ?? '';
  }

  isCredit(txn: TransactionDTO): boolean {
    return txn.type === 'DEPOSIT' ||
      (txn.type === 'TRANSFER' && txn.toAccountId === this.account?.id);
  }
}
