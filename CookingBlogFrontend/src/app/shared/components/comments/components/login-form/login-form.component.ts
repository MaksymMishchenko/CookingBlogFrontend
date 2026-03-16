import { Component, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../../services/auth/auth.service";
import { User } from "../../../../interfaces/auth.interface";
import { HttpContext, HttpErrorResponse } from "@angular/common/http";
import { USER_MESSAGES } from "../../../../services/error/error.constants";
import { AUTH_REDIRECT } from "../../../../../core/http/auth-context";

@Component({
    selector: 'login-form',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login-form.component.html',
    styleUrl: './login-form.component.scss'
})

export class LoginFormComponent {
    authService = inject(AuthService);

    isLoginMode = signal(true);
    isLoading = signal(false);
    formErrors = signal<{ [key: string]: string[] } | null>(null);
    successMessage = signal<string | null>(null);
    generalErrorMessage = signal<string | null>(null);

    modeChanged = output<boolean>();

    username = '';
    password = '';
    email = '';

    onSubmit() {
        if (this.isLoading()) return;
        this.isLoading.set(true);
        this.formErrors.set(null);
        this.successMessage.set(null);
        this.generalErrorMessage.set(null);

        const userPayload: User = {
            userName: this.username,
            password: this.password
        };       

        if (this.isLoginMode()) {
            const loginContext = new HttpContext().set(AUTH_REDIRECT, false);

            this.authService.login(userPayload, loginContext).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.successMessage.set(USER_MESSAGES.LOGIN_SUCCESS);
                },
                error: (err) => this.handleRequestError(err)
            });
        } else {
            this.authService.register({ ...userPayload, email: this.email }).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.isLoginMode.set(true);
                    this.successMessage.set(USER_MESSAGES.REGISTRATION_SUCCESS);
                },
                error: (err) => this.handleRequestError(err)
            });
        }
    }
   
    private handleRequestError(err: HttpErrorResponse) {
        this.isLoading.set(false);

        if (err.status === 401) {           
            this.generalErrorMessage.set(USER_MESSAGES.INVALID_CREDENTIALS);
            return;
        }
        if (err.status === 400 || err.status === 409) {
            const errorBody = err.error;
            
            if (errorBody?.errors) {
                this.formErrors.set(errorBody.errors);
            }
           
            else if (errorBody?.message) {
                this.formErrors.set({
                    'Registration': [errorBody.message]
                });
            }
            return;
        }

        this.generalErrorMessage.set(USER_MESSAGES.UNKNOWN_ERROR);
    }

    toggleMode() {
        this.isLoginMode.set(!this.isLoginMode());
        this.formErrors.set(null);
        this.successMessage.set(null);
        this.modeChanged.emit(this.isLoginMode());
         this.generalErrorMessage.set(null);
    }
}