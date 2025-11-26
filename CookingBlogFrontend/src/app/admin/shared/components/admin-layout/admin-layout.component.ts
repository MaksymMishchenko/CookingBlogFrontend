import { Component } from '@angular/core';
import { AdminNavComponent } from "../admin-nav/admin-nav.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { RouterModule } from "@angular/router";
import { DesktopAlertComponent } from '../../../../shared/components/desktop-alert/desktop-alert.component';



@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AdminHeaderComponent, AdminNavComponent, RouterModule, DesktopAlertComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {

}
