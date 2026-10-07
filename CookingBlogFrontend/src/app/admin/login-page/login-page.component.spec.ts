import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';
import { AuthError } from '../../shared/services/error/error.types';
import { MobileAlertComponent } from '../../shared/components/mobile-alert/mobile-alert.component';
import { DesktopAlertComponent } from '../../shared/components/desktop-alert/desktop-alert.component';
import { UI_ERROR_MESSAGES } from '../../core/constants/ui-messages.constants';

@Component({ selector: 'app-mobile-alert', standalone: true, template: '' })
class MockMobileAlertComponent { }

@Component({ selector: 'app-desktop-alert', standalone: true, template: '' })
class MockDesktopAlertComponent { }

@Component({ standalone: true, template: '' })
class StubPageComponent { }

class FakeAuthService {
    loginResult$: Observable<unknown> = of({ success: true });
    login = () => this.loginResult$;
}

const LOGIN_URL = `/${ADMIN_ROUTER_PATHS.ADMIN}/${ADMIN_ROUTER_PATHS.LOGIN}`;
const DASHBOARD_URL = `/${ADMIN_ROUTER_PATHS.ADMIN}/${ADMIN_ROUTER_PATHS.DASHBOARD}`;

describe('LoginPageComponent', () => {
    let router: Router;
    let auth: FakeAuthService;
    let harness: RouterTestingHarness;

    const openLogin = (query = '') =>
        harness.navigateByUrl(`${LOGIN_URL}${query}`, LoginPageComponent);

    const loginAs = async (page: LoginPageComponent) => {
        page.form.setValue({ username: 'testuser', password: 'password123' });
        page.submit();
        await harness.fixture.whenStable();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    { path: LOGIN_URL.slice(1), component: LoginPageComponent },
                    { path: DASHBOARD_URL.slice(1), component: StubPageComponent },
                    { path: 'admin/posts/edit/:id', component: StubPageComponent },
                    { path: '', component: StubPageComponent },
                ]),
                { provide: AuthService, useClass: FakeAuthService },
            ],
        })
            .overrideComponent(LoginPageComponent, {
                remove: { imports: [MobileAlertComponent, DesktopAlertComponent] },
                add: { imports: [MockMobileAlertComponent, MockDesktopAlertComponent] },
            })
            .compileComponents();

        router = TestBed.inject(Router);
        auth = TestBed.inject(AuthService) as unknown as FakeAuthService;
        harness = await RouterTestingHarness.create();
    });

    describe('after successful login', () => {
        it('goes to the dashboard when there is no returnUrl', async () => {
            // Arrange
            const page = await openLogin();

            // Act
            await loginAs(page);

            // Assert
            expect(router.url).toBe(DASHBOARD_URL);
        });

        it('goes back to the page the user came from', async () => {
            // Arrange
            const page = await openLogin('?returnUrl=%2Fadmin%2Fposts%2Fedit%2F42%3Ftab%3Dseo');

            // Act
            await loginAs(page);

            // Assert
            expect(router.url).toBe('/admin/posts/edit/42?tab=seo');
        });

        it('ignores an external returnUrl and goes to the dashboard', async () => {
            // Arrange
            const page = await openLogin('?returnUrl=https%3A%2F%2Fevil.com');

            // Act
            await loginAs(page);

            // Assert
            expect(router.url).toBe(DASHBOARD_URL);
        });

        it('ignores a protocol-relative returnUrl (//evil.com)', async () => {
            // Arrange
            const page = await openLogin('?returnUrl=%2F%2Fevil.com');

            // Act
            await loginAs(page);

            // Assert
            expect(router.url).toBe(DASHBOARD_URL);
        });

        it('does not bounce back to the login page itself', async () => {
            // Arrange
            const page = await openLogin('?returnUrl=%2Fadmin%2Flogin');

            // Act
            await loginAs(page);

            // Assert
            expect(router.url).toBe(DASHBOARD_URL);
        });
    });

    describe('failed login', () => {
        it('shows the error and stays on the login page', async () => {
            // Arrange
            auth.loginResult$ = throwError(
                () => new AuthError('Invalid credentials', 401, 'dev details', null, 'AUTH_001')
            );
            const page = await openLogin('?returnUrl=%2Fadmin%2Fposts%2Fedit%2F42');

            // Act
            await loginAs(page);
            harness.detectChanges();

            // Assert
            expect(router.url).toContain(LOGIN_URL);
            expect(page.errorMessage).toBe('Invalid credentials');
        });
    });

    describe('form', () => {
        it('does not log in with an invalid form', async () => {
            // Arrange
            const page = await openLogin();
            const loginSpy = spyOn(auth, 'login').and.callThrough();

            // Act
            page.form.setValue({ username: '', password: '' });
            page.submit();
            await harness.fixture.whenStable();

            // Assert
            expect(loginSpy).not.toHaveBeenCalled();
            expect(router.url).toContain(LOGIN_URL);
        });
    });

    describe('access denied', () => {
        it('shows the access denied message', async () => {
            // Arrange + Act
            await openLogin('?accessDenied=true');

            // Assert
            const el = harness.routeDebugElement!.query(By.css('[data-cy="error-message"]'));
            expect(el.nativeElement.textContent).toContain(UI_ERROR_MESSAGES.AUTH.ACCESS_DENIED);
        });
    });
});