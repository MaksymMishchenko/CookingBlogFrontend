import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

interface Alert {
    type: 'success' | 'danger' | 'warning';
    message: string;
}

@Injectable({ providedIn: 'root' })

export class AlertService {

    private alertSubject = new Subject<Alert>();

    alert$ = this.alertSubject.asObservable();

    public ShowErrorMessage(message: string) {
        this.alertSubject.next({ type: 'danger', message });
    }
}