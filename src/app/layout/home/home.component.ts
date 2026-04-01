import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  stats = [
    { value: '$4.2B+', label: 'Assets Managed' },
    { value: '180K+',  label: 'Members'         },
    { value: '99.98%', label: 'Uptime'           },
    { value: '256-bit',label: 'Encryption'       },
  ];

  features = [
    { icon: '◈', title: 'Smart Accounts',
      desc: 'Accounts that adapt to your financial rhythm. Automated optimization and intelligent categorization — always working in your favor, around the clock.' },
    { icon: '⇄', title: 'Instant Transfers',
      desc: "Move money globally in seconds, not days. Real exchange rates, zero markups. Because your money shouldn't be stuck waiting for a bank to catch up." },
    { icon: '◎', title: 'Predictive Insights',
      desc: 'AI-powered analytics that see around corners. Know where you stand, where you\'re going, and how to get there — before the moment demands it.' },
  ];

  trustBadges = [
    'FDIC Insured up to $250,000',
    'SOC 2 Type II Certified',
    '256-bit AES Encryption',
    'Biometric Authentication',
    'Real-time Fraud Detection',
  ];

  testimonials = [
    { quote: '"Switching to Nexus was the smartest financial decision I\'ve made this decade. The analytics alone paid for themselves."', author: 'MARCUS T. — TECH FOUNDER' },
    { quote: '"Finally, a bank that moves at the speed of business. Instant international transfers changed everything for our firm."', author: 'PRIYA N. — CFO, CONSULTING GROUP' },
    { quote: '"The sophistication here rivals private banking — at a fraction of the barriers to entry. I\'m not going back."', author: 'ELENA V. — PORTFOLIO MANAGER' },
  ];
}
