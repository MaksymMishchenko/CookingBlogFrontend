import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DESKTOP_BREAKPOINT } from '../../../core/constants/breakpoint';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  private breakpointObserver = inject(BreakpointObserver);
  private breakpointSubscription!: Subscription;

  mainMenu = [
    { label: "Home page", link: "/" },
    { label: "About", link: "/about" },
    { label: "Contact", link: "/contact" }
  ];

  ngOnInit() {
    this.breakpointSubscription = this.breakpointObserver.observe(DESKTOP_BREAKPOINT)
      .subscribe(result => {
        if (result.matches) {
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
      const isMobile = !this.breakpointObserver.isMatched(DESKTOP_BREAKPOINT);      
      if (isMobile) {
        this.isMenuOpen = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.breakpointSubscription.unsubscribe();
  }
}

