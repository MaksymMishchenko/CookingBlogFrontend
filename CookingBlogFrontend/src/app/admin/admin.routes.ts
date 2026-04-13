import { Routes } from "@angular/router";
import { CreatePageComponent } from "./create-page/create-page.component";
import { DashboardPageComponent } from "./dashboard-page/dashboard-page.component";
import { EditPageComponent } from "./edit-page/edit-page.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { AdminLayoutComponent } from "./shared/components/admin-layout/admin-layout.component";
import { authGuard } from "./shared/services/auth.guard";

export const adminRoutes: Routes = [    
    { path: 'login', component: LoginPageComponent },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardPageComponent },
            { path: 'create', component: CreatePageComponent },
            { path: 'post/:id/edit', component: EditPageComponent },
        ]
    },
    { path: '**', redirectTo: 'login' }
];