import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

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

  private readonly tabletBreakpoint = '(min-width: 35em)';

  mainMenu = [
    { label: "Home page", link: "/" },
    { label: "About", link: "/about" },
    { label: "Contact", link: "/contact" }
  ];

  ngOnInit() {
    this.breakpointSubscription = this.breakpointObserver.observe(this.tabletBreakpoint)
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

  ngOnDestroy(): void {
    this.breakpointSubscription.unsubscribe();
  }
}

