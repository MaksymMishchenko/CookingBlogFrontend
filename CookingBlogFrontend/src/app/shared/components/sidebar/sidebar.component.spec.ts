import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { CategoryService } from '../../services/category/categories.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { of, BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let breakpointServiceMock: any;
    
  const isDesktopSubject = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['getCategories']);
        
    breakpointServiceMock = {
      isDesktop$: isDesktopSubject.asObservable(),
      desktopBreakpoint: '(min-width: 1024px)',
      isMatched: jasmine.createSpy('isMatched')
    };
    
    categoryServiceMock.getCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: BreakpointService, useValue: breakpointServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with categories from CategoryService', () => {
    // Arrange
    const mockCategories = [
      { id: 1, name: 'Pasta', slug: 'pasta' },
      { id: 2, name: 'Soups', slug: 'soups' }
    ];
    categoryServiceMock.getCategories.and.returnValue(of(mockCategories as any));

    // Act
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert
    expect(component.categories()).toEqual(mockCategories as any);
  });

  it('should update isDesktop and isMenuOpen when breakpoint changes', () => {
    // Act
    isDesktopSubject.next(true);
    fixture.detectChanges();

    // Assert
    expect(component.isDesktop()).toBeTrue();
    expect(component.isMenuOpen()).toBeTrue();
    expect(component.cursorStyle()).toBe('default');

    // Act
    isDesktopSubject.next(false);
    fixture.detectChanges();

    // Assert
    expect(component.isDesktop()).toBeFalse();
    expect(component.isMenuOpen()).toBeFalse();
    expect(component.cursorStyle()).toBe('pointer');
  });

  it('should toggle menu only in mobile mode', () => {
    // Arrange
    isDesktopSubject.next(false);
    fixture.detectChanges();

    // Act
    component.toggleMenu();
    // Assert
    expect(component.isMenuOpen()).toBeTrue();

    // Arrange
    isDesktopSubject.next(true);
    fixture.detectChanges();
    
    // Act
    component.toggleMenu();
    // Assert
    expect(component.isMenuOpen()).toBeTrue();
  });

  it('should close menu in mobile mode via closeMenu()', () => {
    // Arrange
    isDesktopSubject.next(false);
    component.isMenuOpen.set(true);

    // Act
    component.closeMenu();

    // Assert
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('should close menu on window scroll in mobile mode', () => {
    // Arrange
    isDesktopSubject.next(false);
    component.isMenuOpen.set(true);

    // Act
    component.onWindowScroll();

    // Assert
    expect(component.isMenuOpen()).toBeFalse();
  });

  it('should NOT close menu on scroll in desktop mode', () => {
    // Arrange
    isDesktopSubject.next(true);
    component.isMenuOpen.set(true);

    // Act
    component.onWindowScroll();

    // Assert
    expect(component.isMenuOpen()).toBeTrue();
  });
});