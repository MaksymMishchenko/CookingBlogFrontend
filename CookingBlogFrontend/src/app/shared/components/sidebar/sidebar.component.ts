import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { CategoryService } from '../../services/category/categories.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { UI_MESSAGES } from '../../../core/constants/ui-messages';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private readonly breakpointService = inject(BreakpointService);
  private readonly categoryService = inject(CategoryService);

  isDesktop = toSignal(this.breakpointService.isDesktop$, { initialValue: false });
  private _isMenuOpenManual = signal(false);

  isMenuVisible = computed(() => this.isDesktop() || this._isMenuOpenManual());
  cursorStyle = computed(() => this.isDesktop() ? 'default' : 'pointer');

  private readonly categoriesRaw = toSignal(
    this.categoryService.getCategories().pipe(
      catchError(() => of(null))
    ),
    { initialValue: undefined }
  );

  viewState = computed(() => {
    const raw = this.categoriesRaw();
    if (raw === undefined) return 'loading';
    if (raw === null) return 'error';
    if (Array.isArray(raw) && raw.length === 0) return 'empty';
    return 'data';
  });

  statusMessage = computed(() => {
    switch (this.viewState()) {
      case 'loading': return UI_MESSAGES.COMMON.LOADING;
      case 'error': return UI_MESSAGES.COMMON.LOAD_ERROR('categories');
      case 'empty': return UI_MESSAGES.COMMON.EMPTY('categories');
      default: return null;
    }
  });

  categories = computed(() => {
    const value = this.categoriesRaw();
    return Array.isArray(value) ? value : [];
  });

  toggleMenu() {
    if (!this.isDesktop()) {
      this._isMenuOpenManual.update(v => !v);
    }
  }

  closeMenu() {
    this._isMenuOpenManual.set(false);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isDesktop() && this.isMenuVisible()) {
      this._isMenuOpenManual.set(false);
    }
  }
}