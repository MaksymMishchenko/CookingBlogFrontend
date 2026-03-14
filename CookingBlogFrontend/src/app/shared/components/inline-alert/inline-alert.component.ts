import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-inline-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div class="inline-error-box">        
        <p>{{ message }}</p>
      </div>
    }
  `,
  styles: [`
    .inline-error-box {
      background-color: #fff1f0;
      border: 1px solid #ffa39e;
      padding: 12px 16px;
      border-radius: 8px;
      color: #e31e24;
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.4;
      
      p { 
        margin: 0; 
        display: inline; 
      }
    }
  `]
})
export class InlineAlertComponent implements OnInit, OnDestroy {
  private alertService = inject(AlertService);
  public message: string = '';
  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.alertService.inlineError$.subscribe(msg => {
      this.message = msg;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.alertService.clearInlineError();
  }
}