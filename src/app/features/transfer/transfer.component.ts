import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import {AccountDTO, AccountService} from '../../core/services/account.service';
import {ShortenPrefixPipe} from '../../shorten-prefix.pipe';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TransactionDTO, TransactionService} from '../../core/services/transaction.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelect,
    MatOption,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatInput,
    CommonModule,
    ShortenPrefixPipe,
    MatProgressSpinner
  ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss'
})
export class TransferComponent implements OnInit {
  accounts: AccountDTO[] = [];
  lastTransaction: TransactionDTO | null = null;

  loading = true;
  submitting = false;
  submitError: string | null = null;

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);

  transferForm = this.fb.group({
    transferFrom: [null as number | null, Validators.required],
    transferTo: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    transferDate: [new Date(), Validators.required],
    note: ['']
  });

  ngOnInit() {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false; // Hide spinner when data arrives
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
        this.loading = false;
      }
    });
  }

  protected onSubmit(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const {transferFrom, transferTo, amount, note} = this.transferForm.value;

    this.submitting = true;
    this.submitError = null;

    this.transactionService.transfer({
      fromAccountId: transferFrom!,
      toAccountId: transferTo!,
      amount: amount!,
      description: note || undefined
    }).subscribe({
      next: (txn) => {
        this.submitting = false;
        this.lastTransaction = txn;
        this.transferForm.reset({transferDate: new Date()});
        this.snackBar.open(
          `Transfer successful — ref: ${txn.transactionReference}`,
          'OK',
          {duration: 6000}
        );
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.submitError = this.resolveErrorMessage(err);
      }
    });
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    // Backend ApiError shape: { status, error, message, timestamp }
    if (err.error?.message) {
      return err.error.message;
    }
    switch (err.status) {
      case 422:
        return 'Insufficient funds to complete this transfer.';
      case 400:
        return 'Invalid transfer request. Please check the details.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to make transfers.';
      case 503:
        return 'Transfer service is temporarily unavailable. Please try again shortly.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
