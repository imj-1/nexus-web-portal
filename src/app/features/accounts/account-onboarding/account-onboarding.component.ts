import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AccountService} from '../../../core/services/account.service';
import {resolveAccountType} from '../../../shared/utils/account-type.util';

@Component({
  selector: 'app-account-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './account-onboarding.component.html',
  styleUrls: ['./account-onboarding.component.scss']
})
export class AccountOnboardingComponent implements OnInit {
  productType!: string;
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.productType = this.route.snapshot.paramMap.get('productType') ?? 'basic-savings';
    this.form = this.fb.group({
      initialBalance: [null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    this.accountService.createAccount({
      initialBalance: this.form.value.initialBalance,
      accountType: resolveAccountType(this.productType)
    }).subscribe({
      next: (account) => void this.router.navigate(['/accounts', account.id]),
      error: (err) => {
        this.error = err?.error?.message ?? 'Something went wrong. Please try again.';
        this.loading = false;
      }
    });
  }
}
