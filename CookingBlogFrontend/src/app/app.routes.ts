import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PostPageComponent } from './post-page/post-page.component';
import { AboutPageComponent } from './about-page/about-page.component';

export const routes: Routes = [
    {
        path: '', component: MainLayoutComponent, children: [
            { path: '', component: HomePageComponent },
            { path: 'post/:id', component: PostPageComponent },
            { path: 'about', component: AboutPageComponent }
        ]
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
    }
];
