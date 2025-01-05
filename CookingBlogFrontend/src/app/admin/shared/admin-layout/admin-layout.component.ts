import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {

  constructor(private router: Router,
    private auth: AuthService) { }

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/admin', 'login']);
  }
}
