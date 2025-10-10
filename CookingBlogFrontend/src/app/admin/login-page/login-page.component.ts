import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../shared/components/interfaces';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {

  form!: FormGroup;

  constructor(private auth: AuthService, private router: Router) {

  }

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

    const user: User = {
      userName: this.form.value.username,
      password: this.form.value.password
    }
    
    this.auth.login(user).subscribe(() => {
      this.form.reset();
      this.router.navigate(['/admin', 'dashboard']);
    })
  }
}
