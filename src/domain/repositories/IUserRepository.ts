import { Slot } from "../entities/Slot";
import { Turf } from "../entities/Turf";
import { User } from "../entities/User";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    update(id: string, value: any): Promise<User | null>;
    create(user: User): Promise<User>;
    update(id: string, value: any): Promise<User | null>;
    getAllTurfs(): Promise<Turf[] | null>;
    getTurfById(turfId: string): Promise<Turf | null>;
    getSlotByDay(turfId: string, day: string): Promise<Slot[] | null>;
    bookTheSlots(bookingDets: object): Promise<object>;
    getBookingByUserId(userId: string): Promise<[] | null>;
}