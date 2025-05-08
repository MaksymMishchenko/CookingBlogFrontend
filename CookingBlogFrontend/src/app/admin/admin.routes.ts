import { Routes } from "@angular/router";
import { CreatePageComponent } from "./create-page/create-page.component";
import { DashboardPageComponent } from "./dashboard-page/dashboard-page.component";
import { EditPageComponent } from "./edit-page/edit-page.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { AdminLayoutComponent } from "./shared/components/admin-layout/admin-layout.component";

export const adminRoutes: Routes = [
    {path: '', component: AdminLayoutComponent, children: [        
        { path: 'login', component: LoginPageComponent }, 
        { path: 'dashboard', component: DashboardPageComponent }, 
        { path: 'create', component: CreatePageComponent }, 
        { path: 'post/:id/edit', component: EditPageComponent }
    ]}
];