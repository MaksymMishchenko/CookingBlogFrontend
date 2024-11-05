import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../shared/interfaces';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  form: FormGroup

  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    var user: User = {
      username: this.form.value.username,
      password: this.form.value.password
    }

    this.authService.login(user).subscribe(() => {
      this.form.reset();
      this.router.navigate(['/admin', 'dashboard']);
    })
  }
}
