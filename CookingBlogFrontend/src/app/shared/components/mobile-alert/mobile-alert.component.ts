import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert/alert.service';

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
  public type = 'success';
  alertSubscription!: Subscription;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertSubscription = this.alertService.getGlobalAlerts().subscribe(alert => {
      this.text = alert.message;
      this.type = alert.type;

      const timeOut = setTimeout(() => {
        clearTimeout(timeOut);
        this.text = '';
      }, this.delay);
    });
  }

  ngOnDestroy() {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
  }

}