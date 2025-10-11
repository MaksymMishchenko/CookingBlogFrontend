import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../shared/components/interfaces';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertService } from '../../shared/services/alert.service';

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

  constructor(private auth: AuthService,
    private router: Router,
    public alertService: AlertService) { }

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
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
          this.router.navigate(['/admin', 'dashboard']);
        }
      });
  }
}
