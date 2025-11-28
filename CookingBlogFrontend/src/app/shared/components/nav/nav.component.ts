import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit, OnDestroy {

  private breakpointService = inject(BreakpointService);
  private breakpointServiceSubscription!: Subscription;

  isMenuOpen = false;

  mainMenu = [
    { label: "Home page", link: "/" },
    { label: "About", link: "/about" },
    { label: "Contact", link: "/contact" }
  ];

  public get breakpointSubscriptionForTesting(): Subscription {
    return this.breakpointServiceSubscription;
  }

  ngOnInit() {
    this.breakpointServiceSubscription = this.breakpointService.isDesktop$
      .subscribe(matches => {
        if (matches) {
          this.isMenuOpen = true;
        } else {
          this.isMenuOpen = false;
        }
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen
  }

  @HostListener('window:scroll', []) onWindowScroll() {
    if (this.isMenuOpen) {
      const isMobile = !this.breakpointService.isMatched(this.breakpointService.desktopBreakpoint);
      if (isMobile) {
        this.isMenuOpen = false;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.breakpointServiceSubscription)
      this.breakpointServiceSubscription.unsubscribe();
  }

}

