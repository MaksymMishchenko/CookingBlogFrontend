import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";

@NgModule({
    providers: [
        provideHttpClient(withInterceptorsFromDi())
    ]
})

export class SharedModule {

}