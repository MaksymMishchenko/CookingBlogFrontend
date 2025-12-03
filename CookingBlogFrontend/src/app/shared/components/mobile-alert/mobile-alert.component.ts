import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert/alert.service';
import { AlertType } from '../../services/alert/alert.type';

@Component({
  selector: 'app-mobile-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-alert.component.html',
  styleUrl: './mobile-alert.component.scss'
})
export class MobileAlertComponent implements OnInit, OnDestroy {

  @Input() delay = 5000;
  public text!: string;
  public type: AlertType = AlertType.Success;
  public readonly AlertType = AlertType;
  private timeoutId: any;
  alertSubscription!: Subscription;

  constructor(private alertService: AlertService) { }

  public get alerts(): AlertService {
    return this.alertService;
  }

  ngOnInit() {
    this.alertSubscription = this.alertService.globalAlerts$.subscribe(alert => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.text = alert.message;
      this.type = alert.type;

      this.timeoutId = setTimeout(() => {
        this.text = '';
        this.timeoutId = undefined;
      }, this.delay);
    });
  }

  ngOnDestroy() {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}