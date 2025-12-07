import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdaptivePaginationComponent } from './adaptive-pagination.component';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { PageChangeDetails } from '../../interfaces/global.interface';
import { PAGING_TEST_CASES } from './page-test-cases';

class MockBreakpointService {
  private isDesktopSubject = new Subject<boolean>();
  isDesktop$ = this.isDesktopSubject.asObservable();

  setIsDesktop(value: boolean) {
    this.isDesktopSubject.next(value);
  }
}

describe('AdaptivePaginationComponent', () => {
  let component: AdaptivePaginationComponent;
  let fixture: ComponentFixture<AdaptivePaginationComponent>;
  let mockBreakpointService: MockBreakpointService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdaptivePaginationComponent],
      providers: [
        { provide: BreakpointService, useClass: MockBreakpointService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdaptivePaginationComponent);
    component = fixture.componentInstance;

    component.pageSize = 10;
    component.totalPosts = 100;
    component.currentPage = 1;

    mockBreakpointService = TestBed.inject(BreakpointService) as unknown as MockBreakpointService;
  });

  describe('Compute properties', () => {
    it('should correctly calculate total pages', () => {
      // Assert
      expect(component.totalPages).toBe(10);

      // Act & Assert
      component.totalPosts = 101;
      expect(component.totalPages).toBe(11);

      // Act & Assert
      component.totalPosts = 0;
      expect(component.totalPages).toBe(0);
    });

    PAGING_TEST_CASES.forEach(testCase => {
      it(`should correctly handle case: ${testCase.description}`, () => {
        // Arrange 
        component.totalPosts = testCase.totalPosts;
        component.currentPage = testCase.currentPage;

        // Act & Assert 
        expect(component.visiblePages).toEqual(testCase.expected);
      });
    });
  });

  describe('Desktop & Mobile mode logic', () => {
    let pageChangeSpy: jasmine.Spy;
    let onPageClickSpy: jasmine.Spy;

    beforeEach(() => {
      pageChangeSpy = spyOn(component.pageChange, 'emit');
      onPageClickSpy = spyOn(component, 'onPageClick').and.callThrough();
    });

    it('Mobile: should emit the next page event (replace: false) if more posts exist, and not emit on the last page', () => {
      // Arrange        
      const pageChangeDetails: PageChangeDetails = {
        page: 6,
        replace: false
      };

      component.currentPage = 5;

      // Act
      component.onLoadMoreClick();

      // Assert
      expect(pageChangeSpy).toHaveBeenCalledWith(pageChangeDetails);
      expect(pageChangeSpy).toHaveBeenCalledTimes(1);

      // Act
      component.currentPage = 10;
      component.onLoadMoreClick();

      // Assert
      expect(pageChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('Desktop: should emit pageChange with replace: true for a valid new page', () => {
      // Arrange
      const newPage = 8;
      const pageChangeDetails: PageChangeDetails = {
        page: newPage,
        replace: true
      };

      // Act
      component.onPageClick(newPage);

      // Assert
      expect(pageChangeSpy).toHaveBeenCalledWith(pageChangeDetails);
      expect(pageChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('Desktop: should NOT emit if the target page is the currentPage (Boundary Case 1)', () => {
      // Act
      component.onPageClick(component.currentPage);

      // Assert
      expect(pageChangeSpy).not.toHaveBeenCalled();
    });

    it('Desktop: should NOT emit if the target page is out of bounds (Boundary Case 2)', () => {
      // Act
      component.onPageClick(component.totalPages + 1);
      component.onPageClick(0);

      // Assert
      expect(pageChangeSpy).not.toHaveBeenCalled();
    });

    it('Gateway: handlePageItemClick should call onPageClick when input is a number', () => {
      // Arrange
      const pageNumber = 7;

      // Act
      component.handlePageItemClick(pageNumber);

      // Assert
      expect(onPageClickSpy).toHaveBeenCalledWith(pageNumber);
      expect(onPageClickSpy).toHaveBeenCalledTimes(1);
    });

    it('Gateway: handlePageItemClick should NOT call onPageClick when input is "..." (string)', () => {
      // Act
      component.handlePageItemClick('...');

      // Assert
      expect(onPageClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('INTEGRATION TESTS (DOM & Template Logic)', () => {
    let modeChangedSpy: jasmine.Spy;

    beforeEach(() => {
      modeChangedSpy = spyOn(component.modeChanged, 'emit');
    });

    it('Desktop: should NOT render the wrapper if totalPages is 1 (totalPages > 1 condition)', () => {
      // Arrange & Act
      component.totalPosts = 10;
      component.currentPage = 1;

      mockBreakpointService.setIsDesktop(true);
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.navigation-wrapper');

      // Assert
      expect(wrapper).toBeNull();
    });

    it('Should react to BreakpointService changes and emit modeChanged', () => {
      // Act & Assert 1: Desktop
      mockBreakpointService.setIsDesktop(true);
      fixture.detectChanges();
      expect(component.isDesktop).toBeTrue();
      expect(modeChangedSpy).toHaveBeenCalledWith(true);

      // Act & Assert 2: Mobile
      mockBreakpointService.setIsDesktop(false);
      fixture.detectChanges();
      expect(component.isDesktop).toBeFalse();
      expect(modeChangedSpy).toHaveBeenCalledWith(false);
    });

    it('Desktop: should render desktop elements when isDesktop=true and hide mobile elements', () => {
      // Arrange
      mockBreakpointService.setIsDesktop(true);
      fixture.detectChanges();

      // Act & Assert
      expect(fixture.nativeElement.querySelector('.pagination-desktop')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.load-more-mobile')).toBeFalsy();
    });

    it('Desktop: should disable Previous button on page 1 and Next button on last page', () => {
      // Arrange      
      component.totalPosts = 20;
      component.pageSize = 5;
      mockBreakpointService.setIsDesktop(true);

      // Act & Assert
      component.currentPage = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.nav-button:first-child').disabled).toBeTrue();

      // Act & Assert
      fixture.componentRef.setInput('currentPage', 4);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.nav-button:last-child').disabled).toBeTrue();
    });

    it('Desktop: should call onPageClick with correct arguments when Prev/Next buttons are clicked', () => {
      // Arrange
      mockBreakpointService.setIsDesktop(true);
      const onPageClickSpy = spyOn(component, 'onPageClick').and.callThrough();
      component.currentPage = 5;
      fixture.detectChanges();

      const prevButton = fixture.nativeElement.querySelector('.nav-button:first-child');
      const nextButton = fixture.nativeElement.querySelector('.nav-button:last-child');

      // Act & Assert 1
      prevButton.click();
      expect(onPageClickSpy).toHaveBeenCalledWith(4);

      // Act & Assert 2
      nextButton.click();
      expect(onPageClickSpy).toHaveBeenCalledWith(6);
    });

    it('Desktop: should call handlePageItemClick when a page button is clicked', () => {
      // Arrange
      mockBreakpointService.setIsDesktop(true);
      const onHandlePageItemClick = spyOn(component, 'handlePageItemClick').and.callThrough();
      fixture.detectChanges();

      const pageTwoButton = fixture.debugElement.queryAll(By.css('.page-number-button'))
        .find(el => el.nativeElement.textContent.trim() === '2');

      expect(pageTwoButton).toBeDefined();

      // Act
      pageTwoButton!.nativeElement.click();

      // Assert
      expect(onHandlePageItemClick).toHaveBeenCalledWith(2);
    });

    it('Desktop: should highlight the active page button', () => {
      // Arrange
      mockBreakpointService.setIsDesktop(true);
      component.currentPage = 3;
      fixture.detectChanges();

      // Act
      const activeButton = fixture.debugElement.queryAll(By.css('.page-number-button'))
        .find(btn => btn.nativeElement.classList.contains('active'));

      // Assert
      expect(activeButton).toBeDefined();
      expect(activeButton!.nativeElement.textContent.trim()).toBe('3');
    });

    it('Mobile: should render mobile "Load More" button when isDesktop=false and hasMorePosts=true', () => {
      // Arrange      
      const onLoadMoreClickSpy = spyOn(component, 'onLoadMoreClick').and.callThrough();
      mockBreakpointService.setIsDesktop(false);
      component.totalPosts = 20;
      component.pageSize = 5;
      component.currentPage = 1;

      fixture.detectChanges();

      const loadMoreButton = fixture.nativeElement.querySelector('.btn-load-more');

      // Assert
      expect(loadMoreButton).toBeTruthy();

      // Act & Assert
      loadMoreButton.click();
      expect(onLoadMoreClickSpy).toHaveBeenCalledTimes(1);
    });

    it('Mobile: should render "All posts loaded" message when isDesktop=false and hasMorePosts=false', () => {
      // Arrange
      mockBreakpointService.setIsDesktop(false);
      component.totalPosts = 20;
      component.pageSize = 5;
      component.currentPage = 4;

      // Act
      fixture.detectChanges();

      const noMorePostsMsg = fixture.nativeElement.querySelector('.no-more-posts');

      // Assert
      expect(noMorePostsMsg).toBeTruthy();
      expect(noMorePostsMsg.textContent).toContain('All 20 posts loaded.');
    });
  });
});

