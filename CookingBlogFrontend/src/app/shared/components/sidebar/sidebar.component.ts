import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isMenuOpen = false;
  menuItems = [
    {label: "", link: "/"},
    {label: "Vegan", link: "/vegan"},
    {label: "Salads", link: "/salads"},
    {label: "Pasta", link: "/pasta"},
    {label: "Soups", link: "/soups"},
    {label: "Desserts", link: "/desserts"},
    {label: "Quick and easy", link: "/quick-and-easy"},
  ];
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
