export class Otp {
    id: string;
    email: string;
    code: string;
    createdAt: Date;

    constructor(id: string, email: string, code: string, createdAt: Date) {
        this.id = id;
        this.email = email;
        this.code = code;
        this.createdAt = createdAt;
    }

    isExpired(): boolean {
        const expirationTime = 5 * 60 * 1000;
        return Date.now() > new Date(this.createdAt).getTime() + expirationTime;
    }
}
