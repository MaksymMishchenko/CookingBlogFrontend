import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { TopSidebarComponent } from '../top-sidebar/top-sidebar.component';
import { NavComponent } from '../nav/nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { DesktopAlertComponent } from '../desktop-alert/desktop-alert.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet,
    HeaderComponent,
    TopSidebarComponent,
    NavComponent,
    SidebarComponent,
    FooterComponent,
    DesktopAlertComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

}
