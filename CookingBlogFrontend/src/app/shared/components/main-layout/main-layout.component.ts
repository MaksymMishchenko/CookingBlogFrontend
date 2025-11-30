import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { TopSidebarComponent } from '../top-sidebar/top-sidebar.component';
import { NavComponent } from '../nav/nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { DesktopAlertComponent } from '../desktop-alert/desktop-alert.component';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { Subscription } from 'rxjs';
import { MobileAlertComponent } from '../mobile-alert/mobile-alert.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    HeaderComponent,
    TopSidebarComponent,
    NavComponent,
    SidebarComponent,
    FooterComponent,
    DesktopAlertComponent,
    MobileAlertComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  public isDesktop: boolean = true;
  private breakpointService = inject(BreakpointService);
  breakpointServiceSubscription!: Subscription

  public get breakpointSubscriptionForTesting(): Subscription {
    return this.breakpointServiceSubscription;
  }

  ngOnInit(): void {
    this.breakpointServiceSubscription = this.breakpointService.isDesktop$
      .subscribe(matches => {
        this.isDesktop = matches;
      })
  }

  ngOnDestroy(): void {
    if (this.breakpointServiceSubscription) {
      this.breakpointServiceSubscription.unsubscribe();
    }
  }

}
