import { firstValueFrom } from "rxjs";
import { AlertService } from "./alert.service"
import { fakeAsync, tick } from "@angular/core/testing";
import { Alert, AlertType } from "./alert.type";

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        service = new AlertService();
    });

    it('SHOULD emit all alert types with correct message and type', async () => {
        // Arrange
        const testMessage = 'Test alert message';
        const expectedAlerts: Alert[] = [];
        const receivedAlerts: Alert[] = [];

        const testData = [
            { method: () => service.success(testMessage), expectedType: 'success' },
            { method: () => service.error(testMessage), expectedType: 'error' },
            { method: () => service.warning(testMessage), expectedType: 'warning' },
            { method: () => service.info(testMessage), expectedType: 'info' }
        ];

        testData.forEach(data => {
            expectedAlerts.push({ message: testMessage, type: data.expectedType as AlertType });
        });

        service.globalAlerts$.subscribe(alert => receivedAlerts.push(alert));

        // Act
        testData.forEach(data => {
            data.method();
        });

        // Assert
        expect(receivedAlerts.length).toBe(4);
        expect(receivedAlerts).toEqual(expectedAlerts);
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

    it('SHOULD NOT emit global alerts when hasInlineErrorActive is true', fakeAsync(() => {
        // Arrange
        let emittedAlerts: Alert[] = [];

        service.globalAlerts$.subscribe(alert => emittedAlerts.push(alert));

        // Act & Assert
        service.emitInlineError("Inline error active.");
        expect(service.hasInlineErrorActive).toBe(true);

        service.success("Temporary success message.");
        service.warning("Temporary warning message.");

        expect(emittedAlerts.length).toBe(0);
        tick(service.inlineErrorDurationConstant);
    }));

    it('should reset the active flag and emit an empty string to clear the inline error', async () => {
        // Arrange
        service.emitInlineError('Some error');

        expect(service.hasInlineErrorActive).toBe(true);
        const clearPromise = firstValueFrom(service.inlineError$);

        // Act
        service.clearInlineError();

        // Assert
        expect(service.hasInlineErrorActive).toBe(false);

        const clearedMessage = await clearPromise;
        expect(clearedMessage).toBe('');
    });

    it('SHOULD cancel the previous timeout and reset duration on consecutive calls', fakeAsync(() => {
        // Arrange        
        service.emitInlineError('First error');
        expect(service.hasInlineErrorActive).toBe(true);

        tick(2000);

        // Act
        service.emitInlineError('Second error');

        // Assert
        expect(service.hasInlineErrorActive).toBe(true);

        tick(3000);
        expect(service.hasInlineErrorActive).toBe(true);

        tick(2000);
        expect(service.hasInlineErrorActive).toBe(false);

    }));

    it('SHOULD allow global alerts after inline error duration expires', fakeAsync(() => {
        // Arrange
        const successMessage = 'Global alert after inline error cleared.';
        let emittedAlerts: Alert[] = [];
        service.globalAlerts$.subscribe(alert => emittedAlerts.push(alert));

        // Act & Assert
        service.emitInlineError('Inline error');
        expect(service.hasInlineErrorActive).toBe(true);
        service.error("This message blocked due to inline error.");
        expect(emittedAlerts.length).toBe(0);

        tick(service.inlineErrorDurationConstant);
        expect(service.hasInlineErrorActive).toBe(false);

        service.success(successMessage);

        expect(emittedAlerts.length).toBe(1);
        expect(emittedAlerts[0].message).toBe(successMessage);
        expect(emittedAlerts[0].type).toBe('success');
    }));
});