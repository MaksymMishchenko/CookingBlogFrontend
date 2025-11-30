import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isDesktop = false;

  private breakpointService = inject(BreakpointService);
  private breakpointServiceSubscription!: Subscription;

  menuItems = [
    { label: "Vegan", link: "/vegan" },
    { label: "Salads", link: "/salads" },
    { label: "Pasta", link: "/pasta" },
    { label: "Soups", link: "/soups" },
    { label: "Desserts", link: "/desserts" },
    { label: "Quick and easy", link: "/quick-and-easy" }
  ];

  public get breakpointSubscriptionForTesting(): Subscription {
    return this.breakpointServiceSubscription;
  }

  ngOnInit() {
    this.breakpointServiceSubscription = this.breakpointService.isDesktop$
      .subscribe(matches => {
        this.isMenuOpen = matches;
      });
  }

  toggleMenu() {
    if (this.breakpointService.isMatched(this.breakpointService.desktopBreakpoint)) {
      return;
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    const isMobile = !this.breakpointService.isMatched(this.breakpointService.desktopBreakpoint);

    if (isMobile) {
      this.isMenuOpen = false;
    }
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
    if (this.breakpointServiceSubscription) {
      this.breakpointServiceSubscription.unsubscribe();
    }
  }
}

