import { Component } from '@angular/core';
import { RouterOutlet } from "../../../node_modules/@angular/router/index";
import { PostComponent } from "../shared/components/post/post.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PostComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
