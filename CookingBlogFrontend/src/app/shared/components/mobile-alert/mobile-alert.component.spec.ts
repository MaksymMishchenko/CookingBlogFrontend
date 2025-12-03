import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { AlertService } from "../../services/alert/alert.service";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { MobileAlertComponent } from "./mobile-alert.component";
import { Alert, AlertType } from "../../services/alert/alert.type";
import { By } from "@angular/platform-browser";

const mockGlobalAlertSubject = new Subject<Alert>();

const mockAlertService = jasmine.createSpyObj('AlertService', ['success', 'clearInlineError', 'emitInlineError'],
    {
        globalAlerts$: mockGlobalAlertSubject.asObservable(),
        hasInlineErrorActive: false
    }
);

describe('MobileAlertComponent (Integration Test)', () => {
    let component: MobileAlertComponent;
    let fixture: ComponentFixture<MobileAlertComponent>;

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            imports: [CommonModule, MobileAlertComponent],
            providers: [
                { provide: AlertService, useValue: mockAlertService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MobileAlertComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    const getAlertElement = () => fixture.debugElement.query(By.css('.alert'));

    it('should display message and apply correct CSS class on alert emission', () => {
        // Arrange
        const testAlert: Alert = { message: 'Test Success', type: AlertType.Success };

        // Act
        mockGlobalAlertSubject.next(testAlert);
        fixture.detectChanges();
        let alertEl = getAlertElement()?.nativeElement;

        // Assert
        expect(alertEl).toBeTruthy();
        expect(alertEl?.textContent?.trim()).toBe(testAlert.message);

        expect(alertEl?.classList).toContain('alert-success');

        // Act
        mockGlobalAlertSubject.next({ message: 'Error', type: AlertType.Error });
        fixture.detectChanges();
        alertEl = getAlertElement()?.nativeElement;

        // Assert
        expect(alertEl?.classList).toContain('alert-error');
    });

    it('should clear alert text after @Input() delay and reset timeout on new emission (Cancel)', fakeAsync(() => {
        // Arrange
        component.delay = 1000;
        const initialMessage = 'First';
        const secondMessage = 'Second';

        // Act
        mockGlobalAlertSubject.next({ message: initialMessage, type: AlertType.Info });
        fixture.detectChanges();
        let alertEl = getAlertElement()?.nativeElement;
        // Assert
        expect(alertEl).toBeTruthy();
        tick(500);

        // Act
        mockGlobalAlertSubject.next({ message: secondMessage, type: AlertType.Warning });
        fixture.detectChanges();

        // Assert
        expect(alertEl?.textContent?.trim()).toBe(secondMessage);
        tick(500);

        expect(alertEl).toBeTruthy();
        tick(500);
        fixture.detectChanges();

        expect(getAlertElement()).toBeFalsy();
    }));

    it('should hide the component when AlertService reports hasInlineErrorActive', () => {
        // Arrange
        let testMessage = 'Test Message';

        // Act
        mockGlobalAlertSubject.next({ message: testMessage, type: AlertType.Success });
        fixture.detectChanges();

        // Act
        Object.defineProperty(mockAlertService, 'hasInlineErrorActive', { get: () => true });
        fixture.detectChanges();

        // Assert
        expect(getAlertElement()).toBeFalsy();

        // Act
        Object.defineProperty(mockAlertService, 'hasInlineErrorActive', {
            get: () => false
        });
        fixture.detectChanges();
        // Assert
        expect(getAlertElement()).toBeTruthy();
    });

    it('should unsubscribe from AlertService and clear timeout on ngOnDestroy', fakeAsync(() => {
        // Arrange
        let testMessage = 'Test Message';

        // Act
        mockGlobalAlertSubject.next({ message: testMessage, type: AlertType.Success });

        const subscriptionSpy = spyOn(component.alertSubscription, 'unsubscribe').and.callThrough();
        const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callThrough();

        fixture.destroy();
        // Assert
        expect(subscriptionSpy).toHaveBeenCalled();
        expect(clearTimeoutSpy).toHaveBeenCalledWith(component['timeoutId']);
        tick(100);
    }));
});