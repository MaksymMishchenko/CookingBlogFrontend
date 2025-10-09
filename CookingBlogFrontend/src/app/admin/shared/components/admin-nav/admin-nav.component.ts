import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss'
})
export class AdminNavComponent {
  menuItems = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Create', link: '/admin/create' },
    { label: 'Edit', link: '/edit' }
  ]

  isMenuOpen = false;
  private breakpointObserver = inject(BreakpointObserver);
  private breakpointSubscription!: Subscription;

  private readonly tabletBreakpoint = '(min-width: 35em)';

  constructor(private router: Router){
  }

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

  logout(event: Event) {
    event.preventDefault();
    this.router.navigate(['/admin', 'login']);
    this.toggleMenu();
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
