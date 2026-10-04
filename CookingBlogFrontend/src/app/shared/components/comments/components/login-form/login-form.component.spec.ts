import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpStatusCode } from '@angular/common/http';
import { ValidationError, AppError, BusinessError } from '../../../../services/error/error.types';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const fillForm = (user = 'testuser', pass = 'password123', email = 'test@test.com') => {
    component.authForm.setValue({
      username: user,
      email: email,
      password: pass
    });
  };

  it('should set generalErrorMessage on 401 Unauthorized', () => {
    // Arrange
    const error = new BusinessError(
      'Unauthorized',
      HttpStatusCode.Unauthorized,
      'Developer details',
      null
    );
    
    authServiceSpy.login.and.returnValue(throwError(() => error));
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

  it('should handle ValidationError with errors map from server', () => {
    // Arrange
    const errorMap = { UserName: ['Username already taken'] };

    const validationError = new ValidationError(
      'Validation failed',
      HttpStatusCode.BadRequest,
      'Developer details',
      null,
      errorMap
    );

    authServiceSpy.register.and.returnValue(throwError(() => validationError));

    component.isLoginMode.set(false);
    fillForm();

    // Act
    component.onSubmit();

    // Assert
    expect(component.formErrors()).toEqual(errorMap);
  });

  it('should not call authService if form is invalid', () => {
    // Arrange
    component.authForm.patchValue({ username: '' });

    // Act
    component.onSubmit();

    // Assert
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('should call register method when isLoginMode is false and form is valid', () => {
    // Arrange
    authServiceSpy.register.and.returnValue(of({} as any));

    component.isLoginMode.set(false);
    component.authForm.controls.email.setValidators([]);
    component.authForm.controls.email.updateValueAndValidity();

    fillForm('newuser', 'pass1234', 'new@test.com');

    // Act
    component.onSubmit();

    // Assert
    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(component.isLoginMode()).toBeTrue();
  });

  it('should clear errors, messages and reset form when toggling mode', () => {
    // Arrange
    component.generalErrorMessage.set('Some error');
    component.successMessage.set('Some success');
    fillForm('data', 'data12345', 'data@test.com');

    // Act
    component.toggleMode();

    // Assert
    expect(component.generalErrorMessage()).toBeNull();
    expect(component.successMessage()).toBeNull();
    expect(component.authForm.value.username).toBe('');
    expect(component.isLoginMode()).toBeFalse();
  });

  it('should set registration error message if ValidationError has no errors map', () => {
    // Arrange
    const validationError = new ValidationError(
      'User already exists',
      HttpStatusCode.BadRequest,
      'Developer details',
      null,
      {}
    );

    authServiceSpy.register.and.returnValue(throwError(() => validationError));

    component.isLoginMode.set(false);
    fillForm();

    // Act
    component.onSubmit();

    // Assert
    expect(component.formErrors()).toEqual({ 'Registration': ['User already exists'] });
  });
});