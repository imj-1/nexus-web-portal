import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-savings-accounts',
  templateUrl: './savings-accounts.component.html',
  standalone: true,
  imports: [
    MatIcon,
    MatButton
  ],
  styleUrls: ['./savings-accounts.component.scss']
})
export class SavingsAccountsComponent {

  constructor(private router: Router) {}

  onSelect(productType: 'basic-savings' | 'high-yield-savings' | 'cd'): void {
    void this.router.navigate(['/accounts/account-onboarding', productType]);
  }
}
