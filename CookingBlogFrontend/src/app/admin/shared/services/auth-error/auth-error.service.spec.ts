import { firstValueFrom } from "rxjs";
import { AuthErrorService } from "./auth-error.service";


describe('AuthErrorService (Unit Test)', () => {
    let authErrorService: AuthErrorService;

    beforeEach(() => {
        authErrorService = new AuthErrorService();
    });

    it('should emit error to stream', async () => {
        const errorMessage = 'Invalid credentials';

        const errorPromise = firstValueFrom(authErrorService.errors$);

        authErrorService.emitError(errorMessage);

        const error = await errorPromise;

        expect(error).toBe(errorMessage);
    });
});