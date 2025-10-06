import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  private breakpointObserver = inject(BreakpointObserver);
  private breakpointSubscription!: Subscription;

  private readonly tabletBreakpoint = '(min-width: 35em)';

  menuItems = [
    { label: "", link: "/" },
    { label: "Vegan", link: "/vegan" },
    { label: "Salads", link: "/salads" },
    { label: "Pasta", link: "/pasta" },
    { label: "Soups", link: "/soups" },
    { label: "Desserts", link: "/desserts" },
    { label: "Quick and easy", link: "/quick-and-easy" },
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('window:scroll', []) onWindowScroll() {
    if (this.isMenuOpen) {
      const isMobile = !this.breakpointObserver.isMatched(this.tabletBreakpoint);
      if (isMobile) {
        this.isMenuOpen = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.breakpointSubscription.unsubscribe();
  }
}
