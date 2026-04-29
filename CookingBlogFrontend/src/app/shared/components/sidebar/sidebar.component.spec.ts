import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { CategoryService } from '../../services/category/categories.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { BehaviorSubject, defer } from 'rxjs';
import { provideRouter } from '@angular/router';
import { UI_MESSAGES } from '../../../core/constants/ui-messages';
import { By } from '@angular/platform-browser';

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
      isDesktopSubject.next(false);
      fixture.detectChanges();
      expect(component.isMenuVisible()).toBeFalse();

      component.toggleMenu();
      expect(component.isMenuVisible()).toBeTrue();

      isDesktopSubject.next(true);
      fixture.detectChanges();
      expect(component.isMenuVisible()).toBeTrue();
    });

    it('should handle category loading success', () => {
      categoriesSubject.next(mockCategories);
      fixture.detectChanges();

      expect(component.categories()).toEqual(mockCategories);      
      expect(component.viewState()).toBe('data');
    });

    it('should handle empty categories state', () => {
      categoriesSubject.next([]);
      fixture.detectChanges();

      expect(component.viewState()).toBe('empty');
      expect(component.statusMessage()).toBe(UI_MESSAGES.COMMON.EMPTY('categories'));
    });

    it('should handle error state when service fails', () => {
      categoriesSubject.next(null);
      fixture.detectChanges();

      expect(component.viewState()).toBe('error');
      expect(component.statusMessage()).toBe(UI_MESSAGES.COMMON.LOAD_ERROR('categories'));
    });
  });

  describe('Template Rendering', () => {

    it('should show loader when viewState is loading', () => {
      categoriesSubject.next(undefined);
      fixture.detectChanges();

      const loader = fixture.debugElement.query(By.css('[cy-data="loading"]'));
      expect(loader).toBeTruthy();      
      expect(loader.nativeElement.textContent).toContain(UI_MESSAGES.COMMON.LOADING);
    });

    it('should show error message when viewState is error', () => {
      categoriesSubject.next(null);
      component.toggleMenu();
      fixture.detectChanges();

      const errorMsg = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.nativeElement.textContent).toContain(UI_MESSAGES.COMMON.LOAD_ERROR('categories'));
    });

    it('should show empty state message when viewState is empty', () => {
      categoriesSubject.next([]);
      component.toggleMenu();
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).not.toBeNull();
      expect(emptyState.nativeElement.textContent).toContain(UI_MESSAGES.COMMON.EMPTY('categories'));
    });

    it('should render categories list when data is loaded', () => {
      categoriesSubject.next(mockCategories);
      component.toggleMenu();
      fixture.detectChanges();
      
      const listItems = fixture.debugElement.queryAll(By.css('li'));
      expect(listItems.length).toBe(3);
      expect(listItems[1].nativeElement.textContent).toContain('Pasta');
      expect(listItems[2].nativeElement.textContent).toContain('Soups');
    });

    it('should rotate arrow when menu is visible', () => {
      isDesktopSubject.next(true);
      fixture.detectChanges();

      const arrow = fixture.debugElement.query(By.css('.arrow.rotate'));
      expect(arrow).toBeTruthy();
    });
  });
});