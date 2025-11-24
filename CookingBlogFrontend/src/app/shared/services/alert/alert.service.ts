import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Alert } from "../../interfaces/global.interface";

export type AlertType = 'success' | 'warning' | 'error' | 'info';

@Injectable({ providedIn: 'root' })

export class AlertService {

    private globalAlertSubject = new Subject<Alert>();

    public inlineError$ = new Subject<string>();

    getGlobalAlerts(): Observable<Alert> {
        return this.globalAlertSubject.asObservable();
    }

    success(message: string): void {
        this.globalAlertSubject.next({ message, type: 'success' });
    }

    warning(message: string): void {
        this.globalAlertSubject.next({ message, type: 'warning' });
    }

    error(message: string): void {
        this.globalAlertSubject.next({ message, type: 'error' });
    }

    info(message: string): void {
        this.globalAlertSubject.next({ message, type: 'info' });
    }

    emitInlineError(message: string): void {
        this.inlineError$.next(message);
    }
}