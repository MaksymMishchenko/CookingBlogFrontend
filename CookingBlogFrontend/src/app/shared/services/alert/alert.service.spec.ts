import { firstValueFrom } from "rxjs";
import { AlertService } from "./alert.service"

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        service = new AlertService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('success() shoul emit an alert with type "success" and the correct message', async () => {
        const successMessage = "Success message";
        const alertPromise = firstValueFrom(service.alert$);

        service.success(successMessage);

        const alert = await alertPromise;

        expect(alert.type).toBe('success');
        expect(alert.message).toBe(successMessage);
    });

    it('danger() shoul emit an alert with type "danger" and the correct message', async () => {
        const dangerMessage = 'Danger message';
        const alertPromise = firstValueFrom(service.alert$);

        service.danger(dangerMessage);

        const alert = await alertPromise;

        expect(alert.type).toBe('danger');
        expect(alert.message).toBe(dangerMessage);
    });
});