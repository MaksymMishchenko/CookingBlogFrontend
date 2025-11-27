import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NavComponent } from "./nav.component";
import { provideRouter, Router } from "@angular/router";
import { Component } from "@angular/core";
import { Subject } from "rxjs";
import { BreakpointService } from "../../services/breakpoint/breakpoint.service";
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

describe('NavComponent (Integration testing)', () => {
    let component: NavComponent;
    let fixture: ComponentFixture<NavComponent>;
    let breakpointService: MockBreakpointService;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NavComponent],
            providers: [
                provideRouter([
                    { path: '', component: MockComponent },
                    { path: 'about', component: MockComponent },
                    { path: 'contact', component: MockComponent }
                ]),
                { provide: BreakpointService, useClass: MockBreakpointService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NavComponent);
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
            component.ngOnInit();

            // Act
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
            // Act
            fixture.detectChanges();            
            const listItems = fixture.debugElement.queryAll(By.css('.nav-menu li'));            
            // Assert
            expect(listItems.length).toBe(3);
        });

        it('should toggle menu on button click and update class binding', () => {
            // Arrange
            component.isMenuOpen = false;
            fixture.detectChanges();
            
            const toggleButton = fixture.debugElement.query(By.css('#toggle-menu'));
            const dropdownDiv = fixture.debugElement.query(By.css('.menu-dropdown'));
            
            // Assert
            expect(dropdownDiv.classes['is-open']).toBeFalsy();
            
            // Act
            toggleButton.triggerEventHandler('click', null);
            fixture.detectChanges();
            
            // Assert
            expect(component.isMenuOpen).toBeTrue();
            expect(dropdownDiv.classes['is-open']).toBeTrue();
        });

        it('should call toggleMenu() when a navigation link is clicked', () => {
            // Arrange
            const toggleMenuSpy = spyOn(component, 'toggleMenu');
            fixture.detectChanges();
            
            const navLink = fixture.debugElement.query(By.css('.nav-menu li:first-child a'));

            // Assert
            expect(navLink).toBeTruthy();
            
            // Act
            navLink.triggerEventHandler('click', null);
            
            // Assert
            expect(toggleMenuSpy).toHaveBeenCalled();
        });
    });

});