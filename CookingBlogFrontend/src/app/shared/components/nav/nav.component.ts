import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  mainMenu = ["Home page", "Recipies", "About", "Contact"];
  isMenuOpen = false;
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen
  }
}

