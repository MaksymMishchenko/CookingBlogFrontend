import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert/alert.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertType } from '../../services/alert/alert.type';

@Component({
  selector: 'app-desktop-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './desktop-alert.component.html',
  styleUrl: './desktop-alert.component.scss'
})
export class DesktopAlertComponent implements OnInit, OnDestroy {

  @Input() delay = 5000;
  public text!: string;
  public type = AlertType.Success;
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
