import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AdminNavComponent } from "../admin-nav/admin-nav.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { RouterModule } from "@angular/router";
import { DesktopAlertComponent } from '../../../../shared/components/desktop-alert/desktop-alert.component';
import { BreakpointService } from '../../../../shared/services/breakpoint/breakpoint.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MobileAlertComponent } from '../../../../shared/components/mobile-alert/mobile-alert.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    AdminHeaderComponent,
    AdminNavComponent,
    DesktopAlertComponent,
    MobileAlertComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  public isDesktop: boolean = true;
  private breakpointService = inject(BreakpointService);
  breakpointServiceSubscription!: Subscription;

  public get breakpointSubscriptionForTesting(): Subscription {
    return this.breakpointServiceSubscription;
  }

  ngOnInit(): void {
    this.breakpointServiceSubscription = this.breakpointService.isDesktop$
      .subscribe(matches => {
        this.isDesktop = matches;
      });
  }

  ngOnDestroy(): void {
    if (this.breakpointServiceSubscription) {
      this.breakpointServiceSubscription.unsubscribe();
    }
  }

}
