import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '../../../../shared/services/alert/alert.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit, OnDestroy {

  @Input() delay = 5000;
  public text!: string;
  public type = 'success';
  alertSubscrition!: Subscription;

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.alertSubscrition = this.alertService.getGlobalAlerts().subscribe(alert => {
      this.text = alert.message;
      this.type = alert.type;

      const timeOut = setTimeout(() => {
        clearTimeout(timeOut);
        this.text = '';
      }, this.delay);
    });
  }

  ngOnDestroy() {
    if (this.alertSubscrition) {
      this.alertSubscrition.unsubscribe();
    }
  }
}
