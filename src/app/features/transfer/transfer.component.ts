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

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);

  transferForm = this.fb.group({
    transferFrom: [null as number | null, Validators.required],
    transferTo: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    transferDate: [new Date(), Validators.required],
    note: ['']
  });
  protected loading: any;

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

  protected onSubmit() {
    if (this.transferForm.valid) {
      // Access the raw data from the form
      const transferData = this.transferForm.value;

      console.log('Transfer Initiated:', transferData);

      // TODO: Call backend service here:
      // this.transferService.send(transferData).subscribe(...)
    } else {
      // If the user somehow bypassed the [disabled] button,
      // mark everything as touched to show error messages.
      this.transferForm.markAllAsTouched();
    }
  }
}
