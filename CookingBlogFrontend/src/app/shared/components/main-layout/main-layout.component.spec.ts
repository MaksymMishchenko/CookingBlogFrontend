import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MainLayoutComponent } from "./main-layout.component";
import { By } from "@angular/platform-browser";
import { provideRouter, RouterOutlet } from "@angular/router";
import { Subject } from "rxjs";
import { BreakpointService } from "../../services/breakpoint/breakpoint.service";

class MockBreakpointService {
    private desktopSubject = new Subject<boolean>();

    isDesktop$ = this.desktopSubject.asObservable();
    desktopBreakpoint = '(min-width: 35em)';

    setDesktopState(isDesktop: boolean) {
        this.desktopSubject.next(isDesktop);
    }
}

describe('MainLayoutComponent (Integration testing)', () => {
    let component: MainLayoutComponent;
    let fixture: ComponentFixture<MainLayoutComponent>;
    let breakpointService: MockBreakpointService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MainLayoutComponent],
            providers: [
                provideRouter([]),
                { provide: BreakpointService, useClass: MockBreakpointService }
            ]            
        }).compileComponents();

        fixture = TestBed.createComponent(MainLayoutComponent);
        component = fixture.componentInstance;
        
        breakpointService = TestBed.inject(BreakpointService) as unknown as MockBreakpointService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize subscription and set initial state', () => {
        // Act
        component.ngOnInit();
        breakpointService.setDesktopState(true);

        // Assert
        expect(component.isDesktop).toBeTrue(); 
        expect(component.breakpointSubscriptionForTesting).toBeTruthy(); 
    });

    it('should update isDesktop when breakpoint changes', () => {
        // Arrange
        component.ngOnInit();

        // Act & Assert
        breakpointService.setDesktopState(false);
        expect(component.isDesktop).toBeFalse();

        breakpointService.setDesktopState(true);
        expect(component.isDesktop).toBeTrue();
    });

    it('should unsubscribe on destroy', () => {
        // Arrange
        component.ngOnInit();
        const unsubscribeSpy = spyOn(component.breakpointSubscriptionForTesting, 'unsubscribe');

        // Act
        component.ngOnDestroy();

        // Assert
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should conditionally render desktop/mobile alerts based on breakpoint', () => {
        // Arrange & Act 
        component.isDesktop = true;
        fixture.detectChanges();

        // Assert
        expect(fixture.debugElement.query(By.css('app-desktop-alert'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('app-mobile-alert'))).toBeFalsy();

        // Arrange & Act
        component.isDesktop = false;
        fixture.detectChanges();

        // Assert
        expect(fixture.debugElement.query(By.css('app-desktop-alert'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('app-mobile-alert'))).toBeTruthy();
    });

    it('should render all structural components', () => {
        // Arrange & Act
        fixture.detectChanges();

        // Assert
        const requiredComponents = [
            'app-header',
            'app-nav',
            'app-top-sidebar',
            'app-sidebar',
            'app-footer'
        ];

        requiredComponents.forEach(selector => {
            expect(fixture.debugElement.query(By.css(selector))).toBeTruthy();
        });
        
        expect(fixture.debugElement.query(By.css('main.flex'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.column-sidebar'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.column-main.tile'))).toBeTruthy();
        expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
    });

});