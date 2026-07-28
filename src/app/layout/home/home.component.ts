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
    { value: '100K+', label: '[DEMO] Simulated Users' },
    { value: '250M+',  label: '[DEMO] Sample Transactions'         },
    { value: '99.9%', label: 'Uptime Target'           },
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
    'Enterprise-grade Security',
    'SOC 2 Type II Certified',
    '256-bit AES Encryption',
    'Biometric Authentication',
    'Real-time Fraud Detection',
  ];

  testimonials = [
    { quote: '"[DEMO TESTIMONIAL] This application demonstrates excellent UI/UX design principles and responsive architecture."', author: 'SAMPLE USER 1' },
    { quote: '"[DEMO TESTIMONIAL] The platform showcases modern financial application design patterns and best practices."', author: 'SAMPLE USER 2' },
    { quote: '"[DEMO TESTIMONIAL] An impressive technical implementation of a banking application interface."', author: 'SAMPLE USER 3' },
  ];
}
