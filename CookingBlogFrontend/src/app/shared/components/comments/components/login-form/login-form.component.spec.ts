import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { USER_MESSAGES } from '../../../../services/error/error.constants';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set generalErrorMessage on 401', () => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized'
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.username = 'testuser';
    component.password = 'wrongpassword';
    component.isLoginMode.set(true);

    component.onSubmit();

    expect(component.generalErrorMessage()).toBe('Invalid credentials. Please check your details or sign up.');
    expect(component.isLoading()).toBeFalse();
  });

  it('should set successMessage on successful login', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'mock-token' } as any));

    component.onSubmit();

    expect(component.successMessage()).toBe(USER_MESSAGES.LOGIN_SUCCESS);
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle validation errors (400/409) from server', () => {
    const errors = { username: ['Too short'], password: ['Common password'] };
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { errors }
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.formErrors()).toEqual(errors);
  });

  it('should call register method when isLoginMode is false', () => {
    authServiceSpy.register.and.returnValue(of({} as any));
    component.isLoginMode.set(false);
    component.email = 'test@test.com';

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(component.isLoginMode()).toBeTrue();
  });

  it('should clear errors and messages when toggling mode', () => {
    component.generalErrorMessage.set('Some error');
    component.successMessage.set('Some success');

    component.toggleMode();

    expect(component.generalErrorMessage()).toBeNull();
    expect(component.successMessage()).toBeNull();
    expect(component.isLoginMode()).toBeFalse();
  });

  it('should set registration error from message string if errors object is missing', () => {
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { message: 'User already exists' }
    });
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));
    component.isLoginMode.set(false);

    component.onSubmit();

    expect(component.formErrors()).toEqual({ 'Registration': ['User already exists'] });
  });
});