import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type AlertType = 'success' | 'warning' | 'danger';

export interface Alert {
    type: AlertType;
    message: string;
}

@Injectable({ providedIn: 'root' })

export class AlertService {

    public alert$ = new Subject<Alert>();

    public success(message: string) {
        this.alert$.next({ type: 'success', message });
    }

    public warning(message: string) {
        this.alert$.next({ type: 'warning', message });
    }

    public danger(message: string) {
        this.alert$.next({ type: 'danger', message });
    }
}