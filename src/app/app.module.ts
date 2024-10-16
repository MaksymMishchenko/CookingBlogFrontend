import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { AppRoutingModule } from './app-routing.module';
import { AdminModule } from './admin/admin.module';
import { NavComponent } from './shared/components/nav/nav.component';

@NgModule({
    declarations: [
        AppComponent,
        MainLayoutComponent,
        NavComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule, 
        AdminModule       
    ],
    providers: [],
    bootstrap: [AppComponent]
})

export class AppModule {
}