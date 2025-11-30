import { firstValueFrom } from "rxjs";
import { AlertService } from "./alert.service"
import { fakeAsync, tick } from "@angular/core/testing";

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        service = new AlertService();
    });

    it('should be created', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    it('success() should emit an alert with type "success" and the correct message', async () => {
        // Arrange
        const successMessage = "Success message";
        const alertPromise = firstValueFrom(service.getGlobalAlerts());

        // Act
        service.success(successMessage);

        const alert = await alertPromise;

        // Assert
        expect(alert.type).toBe('success');
        expect(alert.message).toBe(successMessage);
    });

    it('warning() should emit an alert with type "warning" and the correct message', async () => {
        // Arrange
        const warningMessage = "Warning message";
        const alertPromise = firstValueFrom(service.getGlobalAlerts());

        // Act
        service.warning(warningMessage);

        const alert = await alertPromise;

        // Assert
        expect(alert.type).toBe('warning');
        expect(alert.message).toBe(warningMessage);
    });

    it('error() should emit an alert with type "error" and the correct message', async () => {
        // Arrange
        const errorMessage = "Error message";
        const alertPromise = firstValueFrom(service.getGlobalAlerts());

        // Act
        service.error(errorMessage);

        const alert = await alertPromise;

        // Assert
        expect(alert.type).toBe('error');
        expect(alert.message).toBe(errorMessage);
    });

    it('info() should emit an alert with type "info" and the correct message', async () => {
        // Arrange
        const infoMessage = "info message";
        const alertPromise = firstValueFrom(service.getGlobalAlerts());

        // Act
        service.info(infoMessage);

        const alert = await alertPromise;

        // Assert
        expect(alert.type).toBe('info');
        expect(alert.message).toBe(infoMessage);
    });

    it('emitInlineError() should emit the **message string** to the inlineError$ stream', async () => {
        // Arrange
        const errorMessage = 'Error message';
        const alertPromise = firstValueFrom(service.inlineError$);

        // Act
        service.emitInlineError(errorMessage);

        const message = await alertPromise;

        // Assert
        expect(message).toBe(errorMessage);
    });

    it('should not emit to inlineError$ when a global alert is emitted (Isolation Test 1)', fakeAsync(() => {
        // Arrange
        let inlineEmitted = false;

        service.inlineError$.subscribe(() => {
            inlineEmitted = true;
        });

        // Act
        service.success('Test Global Isolation');

        tick(10);

        // Assert
        expect(inlineEmitted).toBeFalse();
    }));

    it('should not emit to getGlobalAlerts() when an inline error is emitted (Isolation Test 2)', fakeAsync(() => {
        // Arrange
        let globalEmitted = false;

        service.getGlobalAlerts().subscribe(() => {
            globalEmitted = true;
        });

        // Act
        service.emitInlineError('Test Inline Isolation');

        tick(10);
        // Assert
        expect(globalEmitted).toBeFalse();
    }));

});