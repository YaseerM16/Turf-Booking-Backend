import { ChatRoom } from "../../../../domain/entities/ChatRoom";
import { Message } from "../../../../domain/entities/Message";
import { Slot } from "../../../../domain/entities/Slot";
import { Turf } from "../../../../domain/entities/Turf";
import { User } from "../../../../domain/entities/User";
import { Wallet } from "../../../../domain/entities/Wallet";
import { BalanceCheckResult } from "../../../../shared/utils/interfaces";
import { Notification } from "../../../../domain/entities/Notification";

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
    sendVerificationMail(userId: string): Promise<void>

    /// <-   Wallet   ->  ///
    createWallet(userId: string): Promise<object>
    getWalletbyId(userId: string): Promise<Wallet | null>
    checkBalance(userId: string, grandTotal: number): Promise<BalanceCheckResult>;

    /// <-   Turf   ->  ///
    getAllTurfs(queryobj: object): Promise<{ turfs: Turf[], totalTurfs: number }>
    getTurfById(turfId: string): Promise<Turf | null>

    getBookingOfUser(userId: string, page: number, limit: number): Promise<{ bookings: any[], totalBookings: number } | null>

    /// <-   Slot   ->  ///
    getSlotsByDay(turfId: string, day: string, date: string): Promise<{ slots: Slot[]; price: number | null }>
    bookTheSlots(fullDetails: any): Promise<object>;
    cancelTheSlot(userId: string, slotId: string, bookingId: string): Promise<object>;
    bookSlotByWallet(userId: string, bookingDets: object): Promise<object>;

    /// <- Chat -> ///
    createChatRoom(userId: string, companyId: string): Promise<ChatRoom>;
    sendMessage(userId: string, companyId: string, data: object): Promise<Message>
    getMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoom } | null>
    getChats(userId: string): Promise<ChatRoom[] | null>;
    deleteForEveryOne(messageId: string): Promise<Message | null>
    deleteForMe(messageId: string): Promise<Message | null>

    /// <- Notificaitons -> ///
    getNotifications(userId: string): Promise<Notification[] | null>;
    updateNotifications(data: object): Promise<Notification[] | null>;
    deleteNotifications(roomId: string, userId: string): Promise<object>
}
