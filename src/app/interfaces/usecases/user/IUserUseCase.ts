import { Slot } from "../../../../domain/entities/Slot";
import { Turf } from "../../../../domain/entities/Turf";
import { User } from "../../../../domain/entities/User";

export interface IUserUseCase {
    RegisterUser(user: User): Promise<User>;
    verifyMail(
        type: string,
        token: string,
        email: string
    ): Promise<User | null>;
    updateProfileImage(_id: string, url: string): Promise<User | null>
    userLogin(email: string, password: string): Promise<User | null>
    updateProfileDetails(_id: string, data: string): Promise<User | null>
    forgotPassword(email: string): Promise<void>
    updatePassword(email: string, password: string): Promise<User | null>
    googleRegister(email: string, username: string): Promise<User | null>
    googleLogin(email: string): Promise<User | null>

    /// <-   Turf   ->  ///
    getAllTurfs(queryobj: object): Promise<{ turfs: Turf[], totalTurfs: number }>
    getTurfById(turfId: string): Promise<Turf | null>
    getSlotsByDay(turfId: string, day: string, date: string): Promise<Slot[] | null>
    bookTheSlots(fullDetails: any): Promise<object>;
    getBookingOfUser(userId: string): Promise<[] | null>
}
