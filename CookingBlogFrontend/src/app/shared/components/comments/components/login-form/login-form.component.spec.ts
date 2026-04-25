import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  const fillForm = (user = 'test', pass = 'password123', email = 'test@test.com') => {
    component.username.set(user);
    component.password.set(pass);
    component.email.set(email);
  };

  it('should set generalErrorMessage on 401', () => {
    // Arrange
    const errorResponse = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized'
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    fillForm();
    component.isLoginMode.set(true);

    // Act
    component.onSubmit();

    // Assert
    expect(component.generalErrorMessage()).toBe('Invalid credentials. Please check your details or sign up.');
    expect(component.isLoading()).toBeFalse();
  });

  it('should set successMessage on successful login', () => {
    // Arrange
    authServiceSpy.login.and.returnValue(of({ token: 'mock-token' } as any));
    fillForm();
    component.isLoginMode.set(true);

    // Act
    component.onSubmit();

    // Assert
    expect(component.successMessage()).toBe('Login successful!');
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle validation errors (400/409) from server', () => {
    // Arrange
    const errors = { username: ['Too short'] };
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { errors }
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    fillForm();

    // Act
    component.onSubmit();

    // Assert
    expect(component.formErrors()).toEqual(errors);
  });

  it('should not call authService if form is invalid', () => {
    // Arrange
    component.username.set('');

    // Act
    component.onSubmit();

    // Assert
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('should call register method when isLoginMode is false', () => {
    // Arrange
    authServiceSpy.register.and.returnValue(of({} as any));

    component.isLoginMode.set(false);
    fillForm('newuser', 'pass123', 'new@test.com');

    // Act
    component.onSubmit();

    // Assert
    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(component.isLoginMode()).toBeTrue();
  });

  it('should clear errors and messages when toggling mode', () => {
    // Arrange
    component.generalErrorMessage.set('Some error');
    component.successMessage.set('Some success');
    fillForm('data', 'data', 'data');

    // Act
    component.toggleMode();

    // Assert
    expect(component.generalErrorMessage()).toBeNull();
    expect(component.successMessage()).toBeNull();
    expect(component.username()).toBe('');
    expect(component.isLoginMode()).toBeFalse();
  });

  it('should set registration error from message string if errors object is missing', () => {
    // Arrange
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { message: 'User already exists' }
    });
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    component.isLoginMode.set(false);
    fillForm();

    // Act
    component.onSubmit();

    // Assert
    expect(component.formErrors()).toEqual({ 'Registration': ['User already exists'] });
  });
});