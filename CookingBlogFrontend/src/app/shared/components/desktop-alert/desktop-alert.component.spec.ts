import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { DesktopAlertComponent } from "./desktop-alert.component";
import { AlertService } from "../../services/alert/alert.service";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";

describe('DesktopAlertComponent (Integration Test)', () => {
    let component: DesktopAlertComponent;
    let fixture: ComponentFixture<DesktopAlertComponent>;
    let mockAlertServiceSpy: jasmine.SpyObj<AlertService>;
    let alertSubject: Subject<any>;

    beforeEach(() => {
        alertSubject = new Subject<any>();
        mockAlertServiceSpy = jasmine.createSpyObj('AlertService', ['getGlobalAlerts']);

        mockAlertServiceSpy.getGlobalAlerts.and.returnValue(alertSubject.asObservable());

        TestBed.configureTestingModule({
            imports: [CommonModule, DesktopAlertComponent],
            providers: [
                { provide: AlertService, useValue: mockAlertServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DesktopAlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getGlobalAlerts on init', () => {
        expect(mockAlertServiceSpy.getGlobalAlerts).toHaveBeenCalled();
    });

    it('should initialize subscription on ngOnInit', () => {
        expect(component.alertSubscrition).toBeDefined();
        expect(component.alertSubscrition.closed).toBeFalse();
    });

    it('should update text and type when alert is received', () => {
        // Arrange
        const testAlert = { message: 'Test message', type: 'error' };

        // Act
        alertSubject.next(testAlert);

        // Assert
        expect(component.text).toBe('Test message');
        expect(component.type).toBe('error');
    });

    it('should clear text after delay', fakeAsync(() => {
        // Arrange
        component.delay = 1000;
        const testAlert = { message: 'Test message', type: 'success' };

        // Act
        alertSubject.next(testAlert);
        expect(component.text).toBe('Test message');

        tick(component.delay + 1);

        // Assert
        expect(component.text).toBe('');
    }));

    it('should unsubscribe on ngOnDestroy', () => {
        // Arrange
        const unsubscribeSpy = spyOn(component.alertSubscrition, 'unsubscribe');

        // Act
        component.ngOnDestroy();

        // Assert
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should not throw error if subscription is undefined on destroy', () => {
        // Arrange
        component.alertSubscrition = undefined as any;

        // Act & Assert
        expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should call getGlobalAlerts only once', () => {
        expect(mockAlertServiceSpy.getGlobalAlerts).toHaveBeenCalledTimes(1);
    });

    describe('Template rendering', () => {

        it('should display alert message in template', () => {
            // Arrange
            const testAlert = { message: 'Test message', type: 'success' };

            // Act
            alertSubject.next(testAlert);
            fixture.detectChanges();

            // Assert
            const alertElement = fixture.nativeElement.querySelector('.alert');
            expect(alertElement.textContent).toContain('Test message');
        });

        it('should apply correct CSS class based on alert type', () => {
            // Arrange
            const testAlert = { message: 'Error message', type: 'error' };

            // Act
            alertSubject.next(testAlert);
            fixture.detectChanges();

            // Assert
            const alertElement = fixture.nativeElement.querySelector('.alert');
            expect(alertElement.classList).toContain('alert-error');
        });

        it('should remove alert from DOM after delay', fakeAsync(() => {
            // Arrange
            const testAlert = { message: 'Test', type: 'success' };

            // Act
            alertSubject.next(testAlert);
            fixture.detectChanges();

            // Assert
            expect(fixture.nativeElement.querySelector('.alert')).toBeTruthy();

            tick(component.delay + 1);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.alert')).toBeFalsy();
        }));

    });

});