import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../shared/interfaces/auth.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AUTH_CONFIG, AUTH_MESSAGES } from '../../core/constants/auth.constants';
import { ADMIN_ROUTER_PATHS } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  public inlineError$!: Observable<string>;
  public accessDeniedMessage = '';
  public readonly authConfig = AUTH_CONFIG;

  constructor(private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService) { }

  ngOnInit() {
    this.inlineError$ = this.alertService.inlineError$;

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

  onInputChange() {
    if (this.alertService.hasInlineErrorActive) {
      this.alertService.clearInlineError();
    }
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
        }
      });
  }
}
