import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { BreakpointService } from '../../../../shared/services/breakpoint/breakpoint.service';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss'
})

export class AdminNavComponent {

  constructor(private auth: AuthService, private router: Router) { }
  private breakpointService = inject(BreakpointService)

  isMenuOpen = false;
  private breakpointServiceSubscription!: Subscription;

  menuItems = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Create', link: '/admin/create' },
    { label: 'Edit', link: '/admin/post/123/edit' }
  ]

  public get breakpointSubscriptionForTesting(): Subscription {
    return this.breakpointServiceSubscription;
  }

  public get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
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
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/admin', 'login']);
    this.toggleMenu();
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

