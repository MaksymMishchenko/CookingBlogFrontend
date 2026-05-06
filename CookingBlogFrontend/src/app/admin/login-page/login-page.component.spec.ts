import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth/auth.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { By } from '@angular/platform-browser';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';
import { AuthError } from '../../shared/services/error/error.types';
import { MobileAlertComponent } from '../../shared/components/mobile-alert/mobile-alert.component';
import { DesktopAlertComponent } from '../../shared/components/desktop-alert/desktop-alert.component';
import { UI_ERROR_MESSAGES } from '../../core/constants/ui-messages.constants';

@Component({ selector: 'app-mobile-alert', standalone: true, template: '' })
class MockMobileAlertComponent { }

@Component({ selector: 'app-desktop-alert', standalone: true, template: '' })
class MockDesktopAlertComponent { }

const MOCK_AUTH_RESPONSE = {
    success: true,
    data: { token: 'header.payload.signature' }
};

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let alertServiceSpy: jasmine.SpyObj<AlertService>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        alertServiceSpy = jasmine.createSpyObj('AlertService', ['clearInlineError']);

        await TestBed.configureTestingModule({
            imports: [LoginPageComponent, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: AlertService, useValue: alertServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: of({ accessDenied: 'true' }) }
                }
            ]
        })
            .overrideComponent(LoginPageComponent, {
                remove: { imports: [MobileAlertComponent, DesktopAlertComponent] },
                add: { imports: [MockMobileAlertComponent, MockDesktopAlertComponent] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize accessDeniedMessage based on query params', () => {
        expect(component.accessDeniedMessage).toBe(UI_ERROR_MESSAGES.AUTH.ACCESS_DENIED);

        const errorDebugEl = fixture.debugElement.query(By.css('[data-cy="error-message"]'));
        expect(errorDebugEl.nativeElement.textContent.trim()).toContain(UI_ERROR_MESSAGES.AUTH.ACCESS_DENIED);
    });

    it('should not call login if form is invalid', () => {
        component.form.setValue({ username: '', password: '' });
        component.submit();
        expect(authServiceSpy.login).not.toHaveBeenCalled();
        expect(component.submitted).toBeFalse();
    });

    it('should navigate to dashboard on successful login', fakeAsync(() => {
        authServiceSpy.login.and.returnValue(of(MOCK_AUTH_RESPONSE as any));
        component.form.setValue({ username: 'testuser', password: 'password123' });

        component.submit();
        tick();

        expect(authServiceSpy.login).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([
            '',
            ADMIN_ROUTER_PATHS.ADMIN,
            ADMIN_ROUTER_PATHS.DASHBOARD
        ]);
        expect(component.submitted).toBeFalse();
    }));

    it('should set errorMessage when AuthError occurs', fakeAsync(() => {
        const testErrorMessage = 'Ivalid credentials';
        const authError = new AuthError(
            testErrorMessage,
            401,
            'Invalid credentials',
            null,
            'AUTH_001'
        );

        authServiceSpy.login.and.returnValue(throwError(() => authError));
        component.form.setValue({ username: 'wrong', password: 'wrong_password' });

        component.submit();
        tick();
        fixture.detectChanges();

        expect(component.errorMessage).toBe(testErrorMessage);

        const errorDisplay = fixture.debugElement.query(By.css('.alert.alert-error'));
        if (errorDisplay) {
            expect(errorDisplay.nativeElement.textContent).toContain(testErrorMessage);
        }
    }));
});