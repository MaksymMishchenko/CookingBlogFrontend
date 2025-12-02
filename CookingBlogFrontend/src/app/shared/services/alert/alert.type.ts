export enum AlertType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
    Info = 'info',
}

export interface Alert {
    type: AlertType;
    message: string;
}