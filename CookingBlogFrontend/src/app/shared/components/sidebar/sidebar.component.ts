import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { CategoryService } from '../../services/category/categories.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  private readonly breakpointService = inject(BreakpointService);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  isMenuOpen = signal(false);
  isDesktop = signal(false);

  cursorStyle = computed(() => this.isDesktop() ? 'default' : 'pointer');
  categories = toSignal(this.categoryService.getCategories(), { initialValue: [] });

  ngOnInit() {   
    this.breakpointService.isDesktop$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(matches => {
        this.isDesktop.set(matches);    
        this.isMenuOpen.set(matches);
      });
  }

  toggleMenu() {    
    if (this.isDesktop()) {
      return;
    }
    this.isMenuOpen.update(state => !state);
  }

  closeMenu() {
    if (!this.isDesktop()) {
      this.isMenuOpen.set(false);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isMenuOpen() && !this.isDesktop()) {
      this.isMenuOpen.set(false);
    }
  }
}