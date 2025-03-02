import { BalanceCheckResult } from "../../shared/utils/interfaces";
import { ChatRoom } from "../entities/ChatRoom";
import { Message } from "../entities/Message";
import { Slot } from "../entities/Slot";
import { Turf } from "../entities/Turf";
import { User } from "../entities/User";
import { Wallet } from "../entities/Wallet";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(userId: string): Promise<User | null>
    update(id: string, value: any): Promise<User | null>;
    create(user: User): Promise<User>;
    update(id: string, value: any): Promise<User | null>;
    googleRegister(email: string, username: string): Promise<User | null>
    topTurfs(): Promise<Turf[]>


    /// <- Wallet -> ///
    createWallet(userId: string): Promise<object>
    getWalletById(userId: string): Promise<Wallet | null>
    checkWalletBalance(userId: string, total: number): Promise<BalanceCheckResult>

    /// <- Booking -> ///
    getBookingByUserId(userId: string, page: number, limit: number): Promise<{ bookings: any[], totalBookings: number } | null>;
    cancleTheSlot(userId: string, slotId: string, bookingId: string): Promise<object>

    /// <- Turf -> ///
    getAllTurfs(queryobj: object): Promise<{ turfs: Turf[]; totalTurfs: number }>;
    getTurfById(turfId: string): Promise<Turf | null>;

    /// <-  Slot  -> ///
    getSlotByDay(turfId: string, day: string, date: string): Promise<{ slots: Slot[]; price: number | null }>
    bookTheSlots(bookingDets: object): Promise<object>;
    bookSlotsByWallet(userId: string, selectedSlots: any): Promise<object>

    /// <- Chat -> ///
    createChatRoom(userId: string, companyId: string): Promise<ChatRoom>;
    sendMessage(userId: string, companyId: string, data: object): Promise<Message>
    getMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoom } | null>
    getChats(userId: string): Promise<ChatRoom[] | null>
    messageDeleteEveryOne(messageId: string): Promise<Message | null>
    messageDeleteForMe(messageId: string): Promise<Message | null>

}