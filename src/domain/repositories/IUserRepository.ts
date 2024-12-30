import { Slot } from "../entities/Slot";
import { Turf } from "../entities/Turf";
import { User } from "../entities/User";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    update(id: string, value: any): Promise<User | null>;
    create(user: User): Promise<User>;
    update(id: string, value: any): Promise<User | null>;
    googleRegister(email: string, username: string): Promise<User | null>

    /// <- Turf -> ///
    getAllTurfs(queryobj: object): Promise<{ turfs: Turf[]; totalTurfs: number }>;
    getTurfById(turfId: string): Promise<Turf | null>;
    getSlotByDay(turfId: string, day: string, date: string): Promise<Slot[] | null>;
    bookTheSlots(bookingDets: object): Promise<object>;
    getBookingByUserId(userId: string): Promise<[] | null>;
}