export interface User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
}

export interface RegisterResponse {
    message: string;
    otp: string;
    user: User;
}

export interface LoginResponse{
    message: string;
    token: string;
    user: User;
}