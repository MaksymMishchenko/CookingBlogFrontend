import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Alert, AlertType } from "./alert.type";

@Injectable({ providedIn: 'root' })

export class AlertService {

    private readonly INLINE_ERROR_DURATION_MS = 5000;
    private readonly DEDUPLICATION_TIME_MS = 15000;    
    private globalAlertSubject = new Subject<Alert>();    
    private lastAlertMessage: string = '';
    private lastAlertTime: number = 0;

    get inlineErrorDurationConstant(): number {
        return this.INLINE_ERROR_DURATION_MS;
    }

    get globalAlerts$(): Observable<Alert> {
        return this.globalAlertSubject.asObservable();
    }

    private emitGlobalAlert(message: string, type: AlertType): void {
        const now = Date.now();
        if (message === this.lastAlertMessage &&
            (now - this.lastAlertTime) < this.DEDUPLICATION_TIME_MS) {
            return;
        }

        this.lastAlertMessage = message;
        this.lastAlertTime = now;
        this.globalAlertSubject.next({ message, type });
    }

    success(message: string): void {
        this.emitGlobalAlert(message, AlertType.Success);
    }

    warning(message: string): void {
        this.emitGlobalAlert(message, AlertType.Warning);
    }

    error(message: string): void {
        this.emitGlobalAlert(message, AlertType.Error);
    }

    info(message: string): void {
        this.emitGlobalAlert(message, AlertType.Info);
    }    

    clearAlertCache(): void {
        this.lastAlertMessage = '';
        this.lastAlertTime = 0;
    }
}