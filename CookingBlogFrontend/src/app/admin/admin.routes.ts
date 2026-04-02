import { Routes } from "@angular/router";
import { CreatePageComponent } from "./create-page/create-page.component";
import { DashboardPageComponent } from "./dashboard-page/dashboard-page.component";
import { EditPageComponent } from "./edit-page/edit-page.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { AdminLayoutComponent } from "./shared/components/admin-layout/admin-layout.component";
import { authGuard } from "./shared/services/auth.guard";

export const adminRoutes: Routes = [
    {path: '', component: AdminLayoutComponent, children: [   
        { path: '', redirectTo: 'login', pathMatch: 'full' },     
        { path: 'login', component: LoginPageComponent }, 
        { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] }, 
        { path: 'create', component: CreatePageComponent, canActivate: [authGuard] }, 
        { path: 'post/:id/edit', component: EditPageComponent, canActivate: [authGuard]},
        { path: '**', redirectTo: 'login' }
    ]}
];