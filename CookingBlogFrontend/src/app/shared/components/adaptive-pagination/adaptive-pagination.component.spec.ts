import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdaptivePaginationComponent } from './adaptive-pagination.component';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { PageChangeDetails } from '../../interfaces/global.interface';

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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdaptivePaginationComponent);
    component = fixture.componentInstance;
    mockBreakpointService = TestBed.inject(BreakpointService) as unknown as MockBreakpointService;
  });

  it('should correctly switch between Desktop and Mobile modes and emit events', () => {
    // Arrange
    let changeModeSpy = spyOn(component.modeChanged, 'emit');
    fixture.detectChanges();

    // Act
    mockBreakpointService.setIsDesktop(true);

    // Assert
    expect(component.isDesktop).toBeTrue();
    expect(changeModeSpy).toHaveBeenCalledWith(true);
    expect(changeModeSpy).toHaveBeenCalledTimes(1);

    // Act
    mockBreakpointService.setIsDesktop(false);

    // Assert
    expect(component.isDesktop).toBeFalse();
    expect(changeModeSpy).toHaveBeenCalledWith(false);
    expect(changeModeSpy).toHaveBeenCalledTimes(2);

    // Act
    mockBreakpointService.setIsDesktop(true);

    // Assert
    expect(component.isDesktop).toBeTrue();
    expect(changeModeSpy).toHaveBeenCalledWith(true);
    expect(changeModeSpy).toHaveBeenCalledTimes(3);

  });

  describe('Compute properties', () => {
    beforeEach(() => {
      component.pageSize = 10;
      component.totalPosts = 100;
      component.currentPage = 1;
    });

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

    it('should correctly calculate hasMorePosts', () => {
      // Act & Assert
      component.currentPage = 1;
      expect(component.hasMorePosts).toBeTruthy();

      // Act & Assert
      component.currentPage = 10;
      expect(component.hasMorePosts).toBeFalsy();

      // Act & Assert
      component.currentPage = 11;
      expect(component.hasMorePosts).toBeFalsy();
    });

    it('should correctly generate pagesArray', () => {
      // Arrange
      const expectedArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      // Assert
      expect(component.pagesArray).toEqual(expectedArray);

      // Act & Assert
      component.totalPosts = 3;
      component.pageSize = 5;
      expect(component.pagesArray).toEqual([1]);

      // Act & Assert
      component.totalPosts = 0;
      expect(component.pagesArray).toEqual([]);
    });
  });

  describe('onLoadMoreClick (Mobile mode logic)', () => {
    let pageChangeSpy: jasmine.Spy;
    beforeEach(() => {
      pageChangeSpy = spyOn(component.pageChange, 'emit');
      component.pageSize = 10;
      component.totalPosts = 100;
    });

    it('should emit the next page event (replace: false) if more posts exist, and not emit on the last page', () => {
      // Arrange
      const expectedDetails: PageChangeDetails = {
        page: 6,
        replace: false
      };
      component.currentPage = 5;

      // Act
      component.onLoadMoreClick();

      // Assert
      expect(pageChangeSpy).toHaveBeenCalledWith(expectedDetails);
      expect(pageChangeSpy).toHaveBeenCalledTimes(1);

      // Act
      component.currentPage = 10;
      component.onLoadMoreClick();
      // Assert
      expect(pageChangeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onPageClick (Desktop mode logic)', () => {
    let pageChangeSpy: jasmine.Spy;
    beforeEach(() => {
      pageChangeSpy = spyOn(component.pageChange, 'emit');
      component.currentPage = 5;
      component.pageSize = 10
      component.totalPosts = 100;
    });

    it('should emit the event to navigate to a new page with replace: true', () => {
      // Arrange
      let expectedDetails: PageChangeDetails = {
        page: 8,
        replace: true
      };

      // Act
      component.onPageClick(8);

      // Assert
      expect(pageChangeSpy).toHaveBeenCalledOnceWith(expectedDetails);
    });

    it('should not emit the event if the page is the same (current page)', () => {
      // Act & Assert
      component.onPageClick(5);
      expect(pageChangeSpy).not.toHaveBeenCalled();

      // Act & Assert
      component.onPageClick(11);
      expect(pageChangeSpy).not.toHaveBeenCalled();

      // Act & Assert
      component.onPageClick(0);
      component.onPageClick(-1);
      expect(pageChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should unsubscribe from BreakpointServiceSubscription on ngOnDestroy', () => {
      // Arrange
      fixture.detectChanges();
      const subscription: any = (component as any).breakpointServiceSubscription;
      const unsubscribeSpy = spyOn(subscription, 'unsubscribe');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('AdaptivePaginationComponent (DOM/Template Interaction)', () => {
    beforeEach(() => {
      component.pageSize = 10;
      component.totalPosts = 100;
      component.currentPage = 1;
      component.isLoading = false;
      fixture.detectChanges();
    });

    describe('Visibility Conditions', () => {

      it('should NOT render the wrapper if totalPages is 1', () => {
        // Arrange & Act
        component.totalPosts = 5;
        fixture.detectChanges();

        const wrapper = fixture.nativeElement.querySelector('.navigation-wrapper');

        // Assert
        expect(wrapper).toBeNull();
      });
    });

    describe('Desktop mode (.pagination-desktop)', () => {
      beforeEach(() => {
        mockBreakpointService.setIsDesktop(true);
        fixture.detectChanges();
      });

      it('should render correct number of page buttons (totalPages)', () => {
        // Act & Assert
        const pageButtons = fixture.nativeElement.querySelectorAll('.pagination-desktop button:not(.nav-button)');
        expect(pageButtons.length).toBe(10);
      });

      it('should set the active class on the current page button', () => {
        // Act & Assert
        component.currentPage = 3;
        fixture.detectChanges();

        const activeBtn = fixture.nativeElement.querySelector('.pagination-desktop button.active');
        expect(activeBtn).toBeTruthy();
        expect(activeBtn.textContent.trim()).toBe('3');
      });

      it('should enable/disable Previous and Next buttons correctly based on currentPage', () => {
        // Act
        component.currentPage = 1;
        fixture.detectChanges();

        let prevButton = fixture.nativeElement.querySelector('.nav-button:first-child');
        let nextButton = fixture.nativeElement.querySelector('.nav-button:last-child');

        // Assert
        expect(prevButton.disabled).toBeTrue();
        expect(nextButton.disabled).toBeFalse();

        // Act
        component.currentPage = 10;
        fixture.detectChanges();

        prevButton = fixture.nativeElement.querySelector('.nav-button:first-child');
        nextButton = fixture.nativeElement.querySelector('.nav-button:last-child');

        // Assert
        expect(prevButton.disabled).toBeFalse();
        expect(nextButton.disabled).toBeTrue();
      });

      it('should call onPageClick when a page button is clicked', () => {
        // Arrange
        const onPageClickSpy = spyOn(component, 'onPageClick');

        component.currentPage = 1;
        fixture.detectChanges();

        const pageThreeButton = fixture.debugElement.queryAll(By.css('.pagination-desktop button'))
          .find(el => el.nativeElement.textContent.trim() === '3');

        // Act
        pageThreeButton!.nativeElement.click();

        // Assert
        expect(onPageClickSpy).toHaveBeenCalledWith(3);
      });
    });

    describe('Mobile Mode (.load-more-mobile)', () => {
      beforeEach(() => {
        mockBreakpointService.setIsDesktop(false);
        fixture.detectChanges();
      });

      it('should display "Load More" button if hasMorePosts is true', () => {
        // Arrange
        component.currentPage = 1;

        // Act
        fixture.detectChanges();

        // Assert
        const loadMoreButton = fixture.nativeElement.querySelector('.btn-load-more');
        expect(loadMoreButton).toBeTruthy();
        expect(loadMoreButton.textContent.trim()).toBe('Load More');
      });

      it('should display "Loading..." when isLoading is true', () => {
        // Arrange & Act
        component.currentPage = 1;
        component.isLoading = true;
        fixture.detectChanges();

        // Assert
        const loadMoreButton = fixture.nativeElement.querySelector('.btn-load-more');
        expect(loadMoreButton.textContent.trim()).toBe('Loading...');
        expect(loadMoreButton.disabled).toBeTrue();
      });

      it('should call onLoadMoreClick when "Load More" is clicked', () => {
        // Arrange
        const onLoadMoreClickSpy = spyOn(component, 'onLoadMoreClick');
        component.currentPage = 1;
        fixture.detectChanges();

        const loadMoreButton = fixture.nativeElement.querySelector('.btn-load-more');

        // Act
        loadMoreButton.click();

        // Assert
        expect(onLoadMoreClickSpy).toHaveBeenCalled();
      });

      it('should display "All X posts loaded." when on the last page', () => {
        // Arrange
        component.currentPage = 10;

        // Act
        fixture.detectChanges();

        // Assert
        const infoText = fixture.nativeElement.querySelector('.no-more-posts');
        expect(infoText).toBeTruthy();
        expect(infoText.textContent.trim()).toBe('All 100 posts loaded.');

        expect(fixture.nativeElement.querySelector('.btn-load-more')).toBeNull();
      });
    });
  });
});
