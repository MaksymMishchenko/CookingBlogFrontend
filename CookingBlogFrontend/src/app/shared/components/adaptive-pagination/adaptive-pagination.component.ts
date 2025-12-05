import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { Subscription } from 'rxjs';
import { PageChangeDetails } from '../../interfaces/global.interface';

@Component({
  selector: 'app-adaptive-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adaptive-pagination.component.html',
  styleUrl: './adaptive-pagination.component.scss'
})
export class AdaptivePaginationComponent implements OnInit, OnDestroy {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalPosts: number = 0;
  @Input() isLoading: boolean = false;

  @Output() pageChange = new EventEmitter<PageChangeDetails>();
  @Output() modeChanged = new EventEmitter<boolean>();

  isDesktop: boolean = false;

  private breakpointService = inject(BreakpointService);
  private breakpointServiceSubscription!: Subscription;

  get totalPages(): number {
    return Math.ceil(this.totalPosts / this.pageSize);
  }

  get hasMorePosts(): boolean {
    return this.currentPage < this.totalPages;
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.breakpointServiceSubscription = this.breakpointService.isDesktop$
      .subscribe(isMatch => {
        this.isDesktop = isMatch;
        this.modeChanged.emit(isMatch);
      })
  }

  onLoadMoreClick(): void {
    if (this.hasMorePosts) {
      this.pageChange.emit({
        page: this.currentPage + 1,
        replace: false
      });
    }
  }

  onPageClick(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.pageChange.emit({
        page: page,
        replace: true
      });
    }
  }

  ngOnDestroy(): void {
    if (this.breakpointServiceSubscription) {
      this.breakpointServiceSubscription.unsubscribe();
    }
  }
}
