export interface User {
    userName: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
}