import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../shared/services/auth/auth.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AUTH_MESSAGES } from '../../core/constants/auth.constants';
import { By } from '@angular/platform-browser';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';

const MOCK_AUTH_RESPONSE = {
    success: true,
    data: {
        token: 'header.payload.signature'
    }
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
        alertServiceSpy = jasmine.createSpyObj('AlertService', ['clearInlineError'], {
            inlineError$: of(null),
            hasInlineErrorActive: false
        });

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
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize accessDeniedMessage based on query params', () => {
        expect(component.accessDeniedMessage).toBe(AUTH_MESSAGES.ACCESS_DENIED);

        const errorDebugEl = fixture.debugElement.query(By.css('[data-cy="error-message"]'));
        expect(errorDebugEl.nativeElement.textContent.trim()).toContain(AUTH_MESSAGES.ACCESS_DENIED);
    });

    it('should not call login if form is invalid', () => {
        component.form.setValue({ username: '', password: '' });
        component.submit();
        expect(authServiceSpy.login).not.toHaveBeenCalled();
        expect(component.submitted).toBeFalse();
    });

    it('should navigate to dashboard on successful login', () => {
        authServiceSpy.login.and.returnValue(of(MOCK_AUTH_RESPONSE as any));
        component.form.setValue({ username: 'testuser', password: 'password123' });

        component.submit();

        expect(authServiceSpy.login).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([
            '',
            ADMIN_ROUTER_PATHS.ADMIN,
            ADMIN_ROUTER_PATHS.DASHBOARD
        ]);

        expect(component.submitted).toBeFalse();
    });

    it('should clear inline error on input change', () => {
        Object.defineProperty(alertServiceSpy, 'hasInlineErrorActive', { get: () => true });

        component.onInputChange();

        expect(alertServiceSpy.clearInlineError).toHaveBeenCalled();
    });
});