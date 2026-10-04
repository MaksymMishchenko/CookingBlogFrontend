import { ChangeDetectionStrategy, Component, inject, output, signal } from "@angular/core";
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../../../../services/auth/auth.service";
import { User } from "../../../../interfaces/auth.interface";
import { HttpStatusCode } from "@angular/common/http";
import { UI_ERROR_MESSAGES, UI_SUCCESS_MESSAGES } from "../../../../../core/constants/ui-messages.constants";
import { AppError, BusinessError, ValidationError } from "../../../../services/error/error.types";

@Component({
    selector: 'login-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login-form.component.html',
    styleUrl: './login-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent {
    private fb = inject(NonNullableFormBuilder);
    authService = inject(AuthService);

    isLoginMode = signal(true);
    isLoading = signal(false);
    formErrors = signal<{ [key: string]: string[] } | null>(null);
    successMessage = signal<string | null>(null);
    generalErrorMessage = signal<string | null>(null);

    modeChanged = output<boolean>();
    
    authForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: [''],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    constructor() {        
        this.updateEmailValidators(this.isLoginMode());
    }

    onSubmit() {        
        if (this.isLoading() || this.authForm.invalid) {
            this.authForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.resetMessages();

        const formValue = this.authForm.getRawValue();
        const userPayload: User = {
            userName: formValue.username,
            password: formValue.password
        };

        if (this.isLoginMode()) {
            this.authService.login(userPayload).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.successMessage.set(UI_SUCCESS_MESSAGES.LOGIN_SUCCESS);
                },
                error: (err) => this.handleRequestError(err)
            });
        } else {
            this.authService.register({ ...userPayload, email: formValue.email }).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.isLoginMode.set(true);
                    this.updateEmailValidators(true);
                    this.successMessage.set(UI_SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
                    this.authForm.patchValue({ password: '', email: '' });
                    this.authForm.markAsPristine();
                    this.authForm.markAsUntouched();
                },
                error: (err) => this.handleRequestError(err)
            });
        }
    }

    toggleMode() {
        this.isLoginMode.update(mode => !mode);
        this.updateEmailValidators(this.isLoginMode());
        this.resetForm();
        this.modeChanged.emit(this.isLoginMode());
    }

    private updateEmailValidators(isLogin: boolean) {
        const emailControl = this.authForm.controls.email;
        if (isLogin) {
            emailControl.clearValidators();
        } else {
            emailControl.setValidators([Validators.required, Validators.email]);
        }
        emailControl.updateValueAndValidity();
    }

    private handleRequestError(err: AppError) {
        this.isLoading.set(false);

        if (err.status === HttpStatusCode.Unauthorized) {
            this.generalErrorMessage.set(UI_ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
            return;
        }
        
        if (err instanceof ValidationError) {
            if (err.errors && Object.keys(err.errors).length > 0) {
                this.formErrors.set(err.errors);
            } else if (err.message) {
                this.formErrors.set({ 'Registration': [err.message] });
            }
            return;
        }
        
        if (err instanceof BusinessError) {
            this.generalErrorMessage.set(err.message);
            return;
        }
       
        this.generalErrorMessage.set(UI_ERROR_MESSAGES.COMMON.UNKNOWN_ERROR);
    }

    private resetMessages() {
        this.formErrors.set(null);
        this.successMessage.set(null);
        this.generalErrorMessage.set(null);
    }

    private resetForm() {
        this.authForm.reset();
        this.resetMessages();
    }
}