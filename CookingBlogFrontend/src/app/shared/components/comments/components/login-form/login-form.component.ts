import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../../services/auth/auth.service";
import { User } from "../../../../interfaces/auth.interface";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { USER_MESSAGES } from "../../../../services/error/error.constants";

@Component({
    selector: 'login-form',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login-form.component.html',
    styleUrl: './login-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoginFormComponent {
    authService = inject(AuthService);

    isLoginMode = signal(true);
    isLoading = signal(false);
    formErrors = signal<{ [key: string]: string[] } | null>(null);
    successMessage = signal<string | null>(null);
    generalErrorMessage = signal<string | null>(null);

    username = signal('');
    password = signal('');
    email = signal('');

    modeChanged = output<boolean>();

    isFormInvalid = computed(() => {
        const hasUsername = this.username().trim().length > 0;
        const hasPassword = this.password().trim().length > 0;
        const hasEmail = this.email().trim().length > 0;

        if (this.isLoginMode()) {
            return !hasUsername || !hasPassword;
        }
        return !hasUsername || !hasPassword || !hasEmail;
    });

    onSubmit() {
        if (this.isLoading() || this.isFormInvalid()) return;

        this.isLoading.set(true);
        this.resetMessages();

        const userPayload: User = {
            userName: this.username(),
            password: this.password()
        };

        if (this.isLoginMode()) {
            this.authService.login(userPayload).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.successMessage.set(USER_MESSAGES.LOGIN_SUCCESS);
                },
                error: (err) => this.handleRequestError(err)
            });
        } else {
            this.authService.register({ ...userPayload, email: this.email() }).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.isLoginMode.set(true);
                    this.successMessage.set(USER_MESSAGES.REGISTRATION_SUCCESS);                    
                    this.password.set('');
                    this.email.set('');
                },
                error: (err) => this.handleRequestError(err)
            });
        }
    }

    toggleMode() {
        this.isLoginMode.update(mode => !mode);
        this.resetForm();
        this.modeChanged.emit(this.isLoginMode());
    }

    private handleRequestError(err: HttpErrorResponse) {
        this.isLoading.set(false);

        if (err.status === HttpStatusCode.Unauthorized) {
            this.generalErrorMessage.set(USER_MESSAGES.INVALID_CREDENTIALS);
            return;
        }

        if (err.status === HttpStatusCode.BadRequest || err.status === HttpStatusCode.Conflict) {
            const errorBody = err.error;
            if (errorBody?.errors) {
                this.formErrors.set(errorBody.errors);
            } else if (errorBody?.message) {
                this.formErrors.set({ 'Registration': [errorBody.message] });
            }
            return;
        }

        this.generalErrorMessage.set(USER_MESSAGES.UNKNOWN_ERROR);
    }

    private resetMessages() {
        this.formErrors.set(null);
        this.successMessage.set(null);
        this.generalErrorMessage.set(null);
    }

    private resetForm() {
        this.username.set('');
        this.password.set('');
        this.email.set('');
        this.resetMessages();
    }
}