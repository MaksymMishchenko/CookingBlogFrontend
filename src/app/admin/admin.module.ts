import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AdminLayoutComponent } from "./shared/admin-layout/admin-layout.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { adminRoutes } from "../app.routes";
import { DashboardPageComponent } from "./dashboard-page/dashboard-page.component";
import { CreatePageComponent } from "./create-page/create-page.component";
import { EditPageComponent } from "./edit-page/edit-page.component";

@NgModule({
    declarations: [
        AdminLayoutComponent,
        LoginPageComponent,
        DashboardPageComponent,
        CreatePageComponent,
        EditPageComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(adminRoutes)
    ],
    exports: [RouterModule],
    providers: []
})

export class AdminModule { }