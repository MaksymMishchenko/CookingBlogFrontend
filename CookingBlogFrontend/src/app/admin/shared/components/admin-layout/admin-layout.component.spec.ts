import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, RouterOutlet } from "@angular/router";
import { Subject } from "rxjs";
import { AdminLayoutComponent } from "./admin-layout.component";
import { BreakpointService } from "../../../../shared/services/breakpoint/breakpoint.service";
import { AuthService } from "../../../../shared/services/auth/auth.service";

class MockBreakpointService {
    private desktopSubject = new Subject<boolean>();

    isDesktop$ = this.desktopSubject.asObservable();

    desktopBreakpoint = '(min-width: 35em)';

    setDesktopState(isDesktop: boolean) {
        this.desktopSubject.next(isDesktop);
    }
}

describe('AdminLayoutComponent (Integration testing)', () => {
    let component: AdminLayoutComponent;
    let fixture: ComponentFixture<AdminLayoutComponent>;
    let breakpointService: MockBreakpointService;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'isAuthenticated']);
        mockAuthService.isAuthenticated.and.returnValue(true);

        await TestBed.configureTestingModule({
            imports: [AdminLayoutComponent],
            providers: [
                provideRouter([]),
                { provide: BreakpointService, useClass: MockBreakpointService },
                { provide: AuthService, useValue: mockAuthService },
            ]
        }).compileComponents();

        breakpointService = TestBed.inject(BreakpointService) as unknown as MockBreakpointService;
    });

    it('should initialize subscription and set initial state', () => {
        fixture = TestBed.createComponent(AdminLayoutComponent);
        component = fixture.componentInstance;

        // Act        
        component.ngOnInit();
        breakpointService.setDesktopState(true);

        // Assert
        expect(component.isDesktop).toBeTrue();
        expect(component.breakpointSubscriptionForTesting).toBeTruthy();
    });

    it('should update isDesktop when breakpoint changes', () => {
        fixture = TestBed.createComponent(AdminLayoutComponent);
        component = fixture.componentInstance;

        // Arrange
        component.ngOnInit();

        // Act & Assert
        breakpointService.setDesktopState(false);
        expect(component.isDesktop).toBeFalse();

        breakpointService.setDesktopState(true);
        expect(component.isDesktop).toBeTrue();
    });

    it('should unsubscribe on destroy', () => {
        fixture = TestBed.createComponent(AdminLayoutComponent);
        component = fixture.componentInstance;

        // Arrange
        component.ngOnInit();
        const unsubscribeSpy = spyOn(component.breakpointSubscriptionForTesting, 'unsubscribe');

        // Act
        component.ngOnDestroy();

        // Assert
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should conditionally render desktop/mobile alerts based on breakpoint', () => {
        fixture = TestBed.createComponent(AdminLayoutComponent);
        component = fixture.componentInstance;

        // Arrange & Act
        component.isDesktop = true;
        fixture.detectChanges();

        // Assert - Desktop
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
        mockAuthService.isAuthenticated.and.returnValue(true);

        fixture = TestBed.createComponent(AdminLayoutComponent);
        component = fixture.componentInstance;

        // Arrange & Act
        fixture.detectChanges();

        // Assert
        const requiredComponents = [
            'app-admin-header',
            'app-admin-nav'
        ];

        requiredComponents.forEach(selector => {
            expect(fixture.debugElement.query(By.css(selector))).toBeTruthy();
        });

        expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
    });
});