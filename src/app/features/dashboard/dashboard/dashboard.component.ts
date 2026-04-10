import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AccountDTO, AccountService} from '../../../core/services/account.service';
import {MatDivider} from '@angular/material/divider';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {RouterLink} from '@angular/router';
import {AccountMonthlySummaryDTO, TransactionService} from '../../../core/services/transaction.service';
import {catchError, forkJoin, of} from 'rxjs';
import {ShortenPrefixPipe} from '../../../shorten-prefix.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDivider,
    MatMenu,
    MatMenuTrigger,
    RouterLink,
    MatMenuItem,
    ShortenPrefixPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  accounts: AccountDTO[] = [];
  loadingAccounts = true;
  accountsError = '';
  accountsExpanded = true;

  /**
   * Keyed by accountId. Populated in parallel after accounts load.
   * Kept separate so a summary failure never breaks the account list.
   */
  summaries: Record<number, AccountMonthlySummaryDTO> = {};
  loadingSummaries = false;

  transferForm: FormGroup;
  transferSubmitted = false;

  // Placeholder spending data — replace when transaction endpoint is available
  spendingData = [
    {label: 'Housing', amount: 2100, percent: 42, color: '#c9a055'},
    {label: 'Food', amount: 680, percent: 14, color: '#e8c97a'},
    {label: 'Transport', amount: 420, percent: 8, color: '#a07840'},
    {label: 'Subscriptions', amount: 180, percent: 4, color: '#6b5230'},
    {label: 'Other', amount: 1620, percent: 32, color: '#2a1f0f'},
  ];

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.transferForm = this.fb.group({
      fromAccount: ['', Validators.required],
      toAccount: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.accountService.getAllAccounts().subscribe({
      next: accounts => {
        this.accounts = accounts;
        this.loadingAccounts = false;
      },
      error: () => {
        this.accountsError = 'Unable to load accounts.';
        this.loadingAccounts = false;
      }
    });
  }

  /**
   * Fire one getMonthlySummary() per account in parallel.
   * A failure on any single summary is swallowed — the chip just shows nothing.
   */
  private loadSummaries(accounts: AccountDTO[]): void {
    if (!accounts.length) return;
    this.loadingSummaries = true;

    const summaryRequests = accounts.map(a =>
      this.transactionService.getMonthlySummary(a.id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(summaryRequests).subscribe(results => {
      results.forEach((summary, i) => {
        if (summary) {
          this.summaries[accounts[i].id] = summary;
        }
      });
      this.loadingSummaries = false;
    });
  }

  getSummary(accountId: number): AccountMonthlySummaryDTO | null {
    return this.summaries[accountId] ?? null;
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  }

  onTransfer(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }
    this.transferSubmitted = true;
  }

  getOffset(index: number): number {
    const circumference = 282.7;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.spendingData[i].percent * 2.827;
    }
    return circumference - offset;
  }

  toggleAccounts(): void {
    this.accountsExpanded = !this.accountsExpanded;
  }

  onTransferMoney(account: AccountDTO): void {
    // TODO: wire to transfer flow
    console.log('Transfer from account:', account.accountNumber);
  }

  onViewDetails(account: AccountDTO): void {
    // TODO: navigate to account details route
    console.log('View details for:', account.accountNumber);
  }

  onViewStatements(account: AccountDTO): void {
    // TODO: navigate to statements route
    console.log('View statements for:', account.accountNumber);
  }

  onViewTransferActivity(account: AccountDTO): void {
    // TODO: navigate to transfer activity route
    console.log('View transfer activity for:', account.accountNumber);
  }

  accountTypeLabel(type: string): string {
    return type?.replace(/_/g, ' ') ?? '';
  }
}
