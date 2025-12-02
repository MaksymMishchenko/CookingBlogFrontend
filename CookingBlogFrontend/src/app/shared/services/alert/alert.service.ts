import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Alert, AlertType } from "./alert.type";

@Injectable({ providedIn: 'root' })

export class AlertService {

    private readonly INLINE_ERROR_DURATION_MS = 5000;

    private inlineErrorTimeoutId: any;
    private hasInlineError = false;

    private globalAlertSubject = new Subject<Alert>();
    private inlineErrorSubject = new Subject<string>();

    get inlineErrorDurationConstant(): number {
        return this.INLINE_ERROR_DURATION_MS;
    }

    get hasInlineErrorActive(): boolean {
        return this.hasInlineError;
    }

    get globalAlerts$(): Observable<Alert> {
        return this.globalAlertSubject.asObservable();
    }

    get inlineError$(): Observable<string> {
        return this.inlineErrorSubject.asObservable();
    }

    private emitGlobalAlert(message: string, type: AlertType): void {
        if (!this.hasInlineError) {
            this.globalAlertSubject.next({ message, type });
        }
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

    emitInlineError(message: string): void {
        if (this.inlineErrorTimeoutId) {
            clearTimeout(this.inlineErrorTimeoutId);
        }

        this.hasInlineError = true;
        this.inlineErrorSubject.next(message);
        this.inlineErrorTimeoutId = setTimeout(() => {
            this.hasInlineError = false;
            this.inlineErrorTimeoutId = undefined;
        }, this.INLINE_ERROR_DURATION_MS);
    }

    clearInlineError(): void {
        this.hasInlineError = false;
        this.inlineErrorSubject.next('');
    }
}