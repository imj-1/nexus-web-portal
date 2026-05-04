import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {UserService} from '../../../core/services/user.service';

@Component({
  selector: 'app-verify-email-sent',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './verify-email-sent.component.html',
  styleUrl: './verify-email-sent.component.scss'
})
export class VerifyEmailSentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  email = '';
  resending = false;
  resendCooldown = 0;
  private cooldownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';

    // If someone lands here directly without an email, send them back
    if (!this.email) {
      this.router.navigate(['/auth/register']);
    }
  }

  resendEmail(): void {
    // if (this.resending || this.resendCooldown > 0) return;
    //
    // this.resending = true;
    //
    // this.userService.resendVerification(this.email).subscribe({
    //   next: () => {
    //     this.resending = false;
    //     this.snackBar.open('Verification email resent!', 'Close', {
    //       duration: 4000,
    //       horizontalPosition: 'center',
    //       verticalPosition: 'top',
    //       panelClass: ['nexus-snackbar-success']
    //     });
    //     this.startCooldown(60);
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     this.resending = false;
    //     this.snackBar.open(
    //       err.error?.message ?? 'Could not resend. Please try again.',
    //       'Close',
    //       {duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'}
    //     );
    //   }
    // });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown = seconds;
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }
}
