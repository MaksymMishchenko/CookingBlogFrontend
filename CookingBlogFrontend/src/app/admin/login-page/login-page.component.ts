import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../shared/interfaces/auth.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AUTH_CONFIG, AUTH_MESSAGES } from '../../core/constants/auth.constants';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';
import { AppError, AuthError } from '../../shared/services/error/error.types';
import { MobileAlertComponent } from '../../shared/components/mobile-alert/mobile-alert.component';
import { DesktopAlertComponent } from '../../shared/components/desktop-alert/desktop-alert.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MobileAlertComponent, DesktopAlertComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  errorMessage: string | null = null;
  public accessDeniedMessage = '';
  public readonly authConfig = AUTH_CONFIG;

  constructor(private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['accessDenied']) {
        this.accessDeniedMessage = AUTH_MESSAGES.ACCESS_DENIED;
      } else {
        this.accessDeniedMessage = '';
      }
    });

    this.form = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.minLength(AUTH_CONFIG.MIN_USERNAME_LENGTH)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(AUTH_CONFIG.MIN_PASSWORD_LENGTH)])
    });
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.submitted = true;

    const user: User = {
      userName: this.form.value.username,
      password: this.form.value.password
    }

    this.auth.login(user)
      .pipe(
        finalize(() => {
          this.submitted = false;
        })
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.router.navigate([
            '',
            ADMIN_ROUTER_PATHS.ADMIN,
            ADMIN_ROUTER_PATHS.DASHBOARD
          ]);
        },
        error: (err: AppError) => {
          if (err instanceof AuthError) {
            this.errorMessage = err.userMessage;
          } else {
            this.errorMessage = null;
          }
        }
      });
  }
}
