import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { CategoryService } from '../../services/category/categories.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { BehaviorSubject, defer } from 'rxjs';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { UI_ERROR_MESSAGES } from '../../../core/constants/ui-messages.constants';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;

  const isDesktopSubject = new BehaviorSubject<boolean>(false);
  const categoriesSubject = new BehaviorSubject<any>(undefined);

  const mockCategories = [
    { id: 1, name: 'Pasta', slug: 'pasta' },
    { id: 2, name: 'Soups', slug: 'soups' }
  ];

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getCategories']);
    categoryServiceMock.getCategories.and.returnValue(defer(() => categoriesSubject.asObservable()));

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        {
          provide: BreakpointService,
          useValue: { isDesktop$: isDesktopSubject.asObservable() }
        },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    isDesktopSubject.next(false);
    categoriesSubject.next(undefined);

    fixture.detectChanges();
  });

  describe('Component Logic (Signals & Methods)', () => {

    it('should calculate isMenuVisible correctly (Mobile vs Desktop)', () => {
      // Arrange
      isDesktopSubject.next(false);
      fixture.detectChanges();
      expect(component.isMenuVisible()).toBeFalse();

      // Act
      component.toggleMenu();

      // Assert
      expect(component.isMenuVisible()).toBeTrue();

      // Act & Assert (Desktop transition)
      isDesktopSubject.next(true);
      fixture.detectChanges();
      expect(component.isMenuVisible()).toBeTrue();
    });

    it('should handle category loading success', () => {
      // Arrange & Act
      categoriesSubject.next(mockCategories);
      fixture.detectChanges();

      // Assert
      expect(component.categories()).toEqual(mockCategories);
      expect(component.viewState()).toBe('data');
    });

    it('should handle empty categories state', () => {
      // Arrange & Act
      categoriesSubject.next([]);
      fixture.detectChanges();

      // Assert
      expect(component.viewState()).toBe('empty');
      expect(component.statusMessage()).toBe(UI_ERROR_MESSAGES.DYNAMIC.EMPTY('categories'));
    });

    it('should handle error state when service fails', () => {
      // Arrange & Act
      categoriesSubject.next(null);
      fixture.detectChanges();

      // Assert
      expect(component.viewState()).toBe('error');
      expect(component.statusMessage()).toBe(UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('categories'));
    });
  });

  describe('Template Rendering', () => {

   it('should show skeleton when viewState is loading', () => {
    // Arrange      
      categoriesSubject.next(undefined);      
      component.toggleMenu(); 

      // Act
      fixture.detectChanges();
      
      // Assert
      const skeletonItems = fixture.debugElement.queryAll(By.css('.skeleton-item'));
      expect(skeletonItems.length).toBeGreaterThan(0);
    });

    it('should show error message when viewState is error', () => {
      // Arrange
      categoriesSubject.next(null);
      component.toggleMenu();

      // Act
      fixture.detectChanges();

      // Assert
      const errorMsg = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.nativeElement.textContent).toContain(UI_ERROR_MESSAGES.DYNAMIC.LOAD_FAILED('categories'));
    });

    it('should show empty state message when viewState is empty', () => {
      // Arrange
      categoriesSubject.next([]);
      component.toggleMenu();

      // Act
      fixture.detectChanges();

      // Assert
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).not.toBeNull();
      expect(emptyState.nativeElement.textContent).toContain(UI_ERROR_MESSAGES.DYNAMIC.EMPTY('categories'));
    });

    it('should render categories list when data is loaded', () => {
      // Arrange
      categoriesSubject.next(mockCategories);
      component.toggleMenu();

      // Act
      fixture.detectChanges();

      // Assert
      const listItems = fixture.debugElement.queryAll(By.css('li'));
      expect(listItems.length).toBe(3);
      expect(listItems[1].nativeElement.textContent).toContain('Pasta');
      expect(listItems[2].nativeElement.textContent).toContain('Soups');
    });

    it('should rotate arrow when menu is visible', () => {
      // Arrange
      isDesktopSubject.next(true);

      // Act
      fixture.detectChanges();

      // Assert
      const arrow = fixture.debugElement.query(By.css('.arrow.rotate'));
      expect(arrow).toBeTruthy();
    });
  });
});