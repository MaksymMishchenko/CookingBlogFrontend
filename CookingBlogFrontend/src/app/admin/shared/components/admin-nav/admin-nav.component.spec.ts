import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminNavComponent } from "./admin-nav.component";
import { Subject } from "rxjs";
import { BreakpointService } from "../../../../shared/services/breakpoint/breakpoint.service";
import { AuthService } from "../../../../shared/services/auth/auth.service";
import { provideRouter, Router } from "@angular/router";
import { By } from "@angular/platform-browser";
import { Component } from "@angular/core";

@Component({ template: '' })
class MockComponent { }

class MockBreakpointService {
    private desktopSubject = new Subject<boolean>();

    isDesktop$ = this.desktopSubject.asObservable();
    desktopBreakpoint = '(min-width: 35em)';

    isMatched = jasmine.createSpy('isMatched').and.returnValue(true);

    setDesktopState(isDesktop: boolean) {
        this.desktopSubject.next(isDesktop);
    }
}

const mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout']);

describe("AdminNavComponent", () => {
    let component: AdminNavComponent;
    let fixture: ComponentFixture<AdminNavComponent>;
    let breakpointService: MockBreakpointService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminNavComponent],
            providers: [
                provideRouter([
                    { path: 'admin/dashboard', component: MockComponent },
                    { path: 'admin/create', component: MockComponent },
                    { path: 'admin/post/:id/edit', component: MockComponent }
                ]),
                { provide: AuthService, useValue: mockAuthService },
                { provide: BreakpointService, useClass: MockBreakpointService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminNavComponent);
        component = fixture.componentInstance;

        router = TestBed.inject(Router);
        breakpointService = TestBed.inject(BreakpointService) as unknown as MockBreakpointService;      
    });

    describe('Component Logic', () => {

        it('should be created', () => {
            // Act & Assert
            expect(component).toBeTruthy();
        });       

        it('should toggle isMenuOpen state', () => {
            // Arrange
            component.isMenuOpen = false;

            // Act
            component.toggleMenu();

            // Assert
            expect(component.isMenuOpen).toBeTrue();

            // Act
            component.toggleMenu();

            // Assert
            expect(component.isMenuOpen).toBeFalse();
        });

        it('should perform logout actions', () => {
            // Arrange
            const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as Event;
            const toggleMenuSpy = spyOn(component, 'toggleMenu');
            const navigateSpy = spyOn(router, 'navigate');

            // Act
            component.logout(mockEvent);

            // Assert
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockAuthService.logout).toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith(['/admin', 'login']);
            expect(toggleMenuSpy).toHaveBeenCalled();
        });
    });

    describe('Lifecycle and Responsive Logic', () => {

        it('should set isMenuOpen=true on ngOnInit if isDesktop$ is true', () => {
            // Arrange
            component.isMenuOpen = false;

            // Act
            component.ngOnInit();
            breakpointService.setDesktopState(true);

            // Assert
            expect(component.isMenuOpen).toBeTrue();
        });

        it('should set isMenuOpen=false if isDesktop$ is false', () => {
            // Arrange
            component.isMenuOpen = true;

            // Act
            component.ngOnInit();
            breakpointService.setDesktopState(false);

            // Assert
            expect(component.isMenuOpen).toBeFalse();
        });

        it('should close menu on scroll when on mobile', () => {
            // Arrange
            breakpointService.isMatched.and.returnValue(false);
            component.isMenuOpen = true;

            // Act
            component.onWindowScroll();

            // Assert
            expect(component.isMenuOpen).toBeFalse();
            expect(breakpointService.isMatched).toHaveBeenCalledWith(breakpointService.desktopBreakpoint);
        });

        it('should NOT close menu on scroll when on desktop', () => {
            // Arrange
            breakpointService.isMatched.and.returnValue(true);
            component.isMenuOpen = true;

            // Act
            component.onWindowScroll();

            // Assert
            expect(component.isMenuOpen).toBeTrue();
        });

        it('should unsubscribe from breakpointService on ngOnDestroy', () => {
            // Arrange
            component.ngOnInit();
            const unsubscribeSpy = spyOn(component.breakpointSubscriptionForTesting, 'unsubscribe');

            // Act
            component.ngOnDestroy();

            // Assert
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
    });

    describe('Template Rendering', () => {

        it('should render correct number of menu items', () => {
            // Arrange & Act
            fixture.detectChanges();
            const listItems = fixture.debugElement.queryAll(By.css('.nav-menu li'));

            // Assert
            expect(listItems.length).toBe(4);
        });

        it('should toggle menu on button click and update class binding', () => {
            // Arrange
            component.isMenuOpen = false;
            fixture.detectChanges();
            const toggleButton = fixture.debugElement.query(By.css('#toggle-menu'));
            const dropdownDiv = fixture.debugElement.query(By.css('.menu-dropdown'));

            // Assert (initial state)
            expect(dropdownDiv.classes['is-open']).toBeFalsy();

            // Act
            toggleButton.triggerEventHandler('click', null);
            fixture.detectChanges();

            // Assert
            expect(component.isMenuOpen).toBeTrue();
            expect(dropdownDiv.classes['is-open']).toBeTrue();
        });

        it('should call logout() when the "Logout" link is clicked', () => {
            // Arrange
            const logoutSpy = spyOn(component, 'logout');
            fixture.detectChanges();
            const logoutLink = fixture.debugElement.query(By.css('.nav-menu li:last-child a'));

            // Act
            logoutLink.triggerEventHandler('click', { preventDefault: jasmine.createSpy('preventDefault') });

            // Assert
            expect(logoutSpy).toHaveBeenCalled();
        });

        it('should call toggleMenu() when a navigation link is clicked', () => {
            // Arrange
            const toggleMenuSpy = spyOn(component, 'toggleMenu');
            fixture.detectChanges();
            const navLink = fixture.debugElement.query(By.css('.nav-menu li:first-child a'));

            // Act
            navLink.triggerEventHandler('click', null);

            // Assert
            expect(toggleMenuSpy).toHaveBeenCalled();
        });

    });
    
});