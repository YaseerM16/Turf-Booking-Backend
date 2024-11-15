export class User {
    name: string;
    email: string;
    phone: number;
    password: string;
    id: string;

    constructor(id: string, name: string, email: string, phone: number, password: string) {
        this.id = id
        this.name = name
        this.email = email
        this.phone = phone
        this.password = password
    }

    isValid(): boolean {
        return this.email.includes("@") && this.password.length >= 6
    }

}