import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PostPageComponent } from './post-page/post-page.component';

export const routes: Routes = [
    {path: '', component: MainLayoutComponent, children: [
        {path: '', component: HomePageComponent},
        {path: 'post/:id', component: PostPageComponent}
    ]}
];
