import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PostPageComponent } from './post-page/post-page.component';
import { AdminLayoutComponent } from './admin/shared/admin-layout/admin-layout.component';
import { LoginPageComponent } from './admin/login-page/login-page.component';
import { DashboardPageComponent } from './admin/dashboard-page/dashboard-page.component';
import { CreatePageComponent } from './admin/create-page/create-page.component';
import { EditPageComponent } from './admin/edit-page/edit-page.component';

export const routes: Routes = [
    {
        path: '', component: MainLayoutComponent, children: [
            /*  { path: '', redirectTo: '/', pathMatch: 'full' }, */
            { path: '', component: HomePageComponent },
            { path: 'post/:id', component: PostPageComponent }
        ]
    },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
];

export const adminRoutes: Routes = [
    {
        path: '', component: AdminLayoutComponent, children: [
            { path: '', redirectTo: '/admin/login', pathMatch: 'full' },
            { path: 'login', component: LoginPageComponent },
            { path: 'dashboard', component: DashboardPageComponent },
            { path: 'create', component: CreatePageComponent },
            { path: 'post/:id/edit', component: EditPageComponent }
        ]
    }
]

