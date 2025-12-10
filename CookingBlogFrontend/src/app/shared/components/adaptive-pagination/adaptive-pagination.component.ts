import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { PageChangeDetails } from '../../interfaces/global.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-adaptive-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adaptive-pagination.component.html',
  styleUrl: './adaptive-pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AdaptivePaginationComponent {
  private breakpointService = inject(BreakpointService);
  private readonly MAX_PAGES_TO_SHOW = 5;

  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalPosts: number = 0;

  @Output() pageChange = new EventEmitter<PageChangeDetails>();
  @Output() modeChanged = new EventEmitter<boolean>();

  isDesktop: boolean = false;

  constructor() {                 
    this.breakpointService.isDesktop$
      .pipe(takeUntilDestroyed())
      .subscribe(isMatch => {
        this.isDesktop = isMatch;
        this.modeChanged.emit(isMatch);
      })
  }

  get totalPages(): number {
    return Math.ceil(this.totalPosts / this.pageSize);
  }

  get hasMorePosts(): boolean {
    return this.currentPage < this.totalPages;
  }

  get visiblePages(): Array<number | string> { 
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.MAX_PAGES_TO_SHOW; 

    if (total <= max) {      
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    const rangeSize = 2;
   
    let start = current - rangeSize;
    let end = current + rangeSize;
    
    if (start <= 1) {
      end = Math.min(total - 1, end + (1 - start));
      start = 2;
    }
    
    if (end >= total) {
      start = Math.max(2, start - (end - total));
      end = total - 1;
    }   

    const pages: Array<number | string> = [];    
    pages.push(1);
   
    if (start > 2) {
      pages.push('...');
    } else {     
      start = 2;
    }
    
    for (let i = start; i <= end; i++) {      
      if (i > 1 && i < total) {
        pages.push(i);
      }
    }
    
    if (end < total - 1) {
      pages.push('...');
    }
    
    if (pages[pages.length - 1] !== total) {
      pages.push(total);
    }
   
    return pages.filter((value, index) => value !== '...' || pages[index - 1] !== '...');
  }
  
 onLoadMoreClick(): void {
    if (this.hasMorePosts) {
      this.pageChange.emit({
        page: this.currentPage + 1,
        replace: false
      });
    }
  }

  public handlePageItemClick(item: number | string): void {
    if (typeof item === 'number') {      
      this.onPageClick(item);
    }    
  }

  public trackPageByFn(index: number, item: number | string): number | string {    
    if (item === '...') {      
      return item + index;
    }   
    return item;
  }

  onPageClick(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.pageChange.emit({
        page: page,
        replace: true
      });
    }
  } 
}
