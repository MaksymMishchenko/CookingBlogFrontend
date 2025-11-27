import { Component } from "@angular/core";
import { Subject } from "rxjs";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { BreakpointService } from "../../services/breakpoint/breakpoint.service";
import { SidebarComponent } from "./sidebar.component";
import { By } from "@angular/platform-browser";

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

describe("SidebarComponent (Integration testing)", () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let breakpointService: MockBreakpointService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [
                provideRouter([
                    { path: "vegan", component: MockComponent },
                    { path: "salads", component: MockComponent },
                    { path: "pasta", component: MockComponent },
                    { path: "soups", component: MockComponent },
                    { path: "desserts", component: MockComponent },
                    { path: "quick-and-easy", component: MockComponent }
                ]),
                { provide: BreakpointService, useClass: MockBreakpointService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;

        router = TestBed.inject(Router);
        breakpointService = TestBed.inject(BreakpointService) as unknown as MockBreakpointService;
    });

    describe('Component Logic', () => {

        it('should be created', () => {
            // Assert
            expect(component).toBeTruthy();
        });

        it('should toggle isMenuOpen state', () => {
            // Arrange
            breakpointService.isMatched.and.returnValue(false);
            component.isMenuOpen = false;

            // Act & Assert
            component.toggleMenu();
            expect(component.isMenuOpen).toBeTrue();

            // Act & Assert
            component.toggleMenu();
            expect(component.isMenuOpen).toBeFalse();
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
            component.isMenuOpen = true;

            // Act
            component.onWindowScroll();

            // Assert
            expect(component.isMenuOpen).toBeTrue();
        });

        it('should unsubscribe from breakpointService on ngOnDestroy', () => {
            // Arrange
            component.ngOnInit();

            // Act
            const unsubscribeSpy = spyOn(component.breakpointSubscriptionForTesting, 'unsubscribe');
            component.ngOnDestroy();

            // Assert
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
    });

    describe('Template Rendering', () => {

        it('should render category items', () => {
            // Act
            fixture.detectChanges();
            const sidebar = fixture.debugElement.query(By.css('a'));

            // Assert
            expect(sidebar).not.toBeNull();
        });

        it('should render correct number of category items', () => {
            // Aсt
            fixture.detectChanges();
            const listItems = fixture.debugElement.queryAll(By.css('a'));

            // Assert
            expect(listItems.length).toBe(6);
        });

        it('should toggle menu on button click and update class binding', () => {
            // Arrange 
            breakpointService.isMatched.and.returnValue(false);

            component.isMenuOpen = false;
            fixture.detectChanges();

            const toggleElement = fixture.debugElement.query(By.css('.menu-title'));
            const menuListElement = fixture.debugElement.query(By.css('.sidebar-menu'));

            // Assert
            expect(menuListElement.classes['show']).toBeFalsy();

            // Act
            toggleElement.triggerEventHandler('click', null);
            fixture.detectChanges();

            // Assert
            expect(component.isMenuOpen).toBeTrue();
            expect(menuListElement.classes['show']).toBeTrue();
        });

        it('should call closeMenu() when a navigation link is clicked', () => {
            // Arrange           
            const closeMenuSpy = spyOn(component, 'closeMenu');

            fixture.detectChanges();
            const navLink = fixture.debugElement.query(By.css('.sidebar-menu li:first-child a'));

            // Assert
            expect(navLink).toBeTruthy();

            // Act
            navLink.triggerEventHandler('click', null);

            // Assert
            expect(closeMenuSpy).toHaveBeenCalled();
        });
    });
});