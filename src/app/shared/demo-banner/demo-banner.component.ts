import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-demo-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-banner" *ngIf="isVisible">
      <div class="banner-content">
        <span class="banner-text">
          ⚠️ <strong>DEMO APPLICATION:</strong> This is a personal project application, not a real financial institution. Do not use real passwords or credentials.
        </span>
        <button class="banner-close" (click)="dismiss()" aria-label="Dismiss banner">×</button>
      </div>
    </div>
  `,
  styles: [`
    .demo-banner {
      width: 100%;
      background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
      color: #333;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      position: sticky;
      top: 0;
      z-index: 10000;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }

    .banner-text {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .banner-close {
      background: none;
      border: none;
      color: #333;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      margin-left: 16px;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .banner-close:hover {
      opacity: 1;
    }

    strong {
      font-weight: 600;
    }
  `]
})
export class DemoBannerComponent implements OnInit {
  isVisible = true;

  ngOnInit() {
    this.isVisible = true;
  }

  dismiss() {
    this.isVisible = false;
  }
}
