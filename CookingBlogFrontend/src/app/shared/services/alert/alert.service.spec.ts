import { AlertService } from "./alert.service"
import { fakeAsync, tick } from "@angular/core/testing";
import { Alert } from "./alert.type";

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        service = new AlertService();
    });

    it('SHOULD emit all alert types with same message when time passes', fakeAsync(() => {
        // Arrange
        const testMessage = 'Test alert message';
        const receivedAlerts: Alert[] = [];    
        service.globalAlerts$.subscribe(alert => receivedAlerts.push(alert));

        // Act
        service.success(testMessage);
        
        tick(15001);
        service.error(testMessage);

        tick(15001);
        service.warning(testMessage);

        tick(15001);
        service.info(testMessage);

        // Assert
        expect(receivedAlerts.length).toBe(4);
    }));

    it('SHOULD deduplicate identical messages within the time window', () => {
        // Arrange
        const message = 'Same message';
        const received: Alert[] = [];
        service.globalAlerts$.subscribe(a => received.push(a));

        // Act
        service.error(message);
        service.error(message);
        service.success(message);

        // Assert
        expect(received.length).toBe(1);
    });    
});