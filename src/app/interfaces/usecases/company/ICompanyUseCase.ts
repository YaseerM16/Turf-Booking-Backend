import { ChatRoom } from "../../../../domain/entities/ChatRoom";
import { Company } from "../../../../domain/entities/Company";
import { Message } from "../../../../domain/entities/Message";
import { Slot } from "../../../../domain/entities/Slot";
import { Turf } from "../../../../domain/entities/Turf";

export interface ICompanyUseCase {
    RegisterCompany(company: Company): Promise<Company>;
    verifyMail(
        type: string,
        token: string,
        email: string
    ): Promise<Company | null>;
    companyLogin(email: string, password: string): Promise<Company | null>
    updateProfileImage(companyId: string, imageUrl: string): Promise<Company | null>
    updateProfileDetails(companyId: string, data: string): Promise<Company | null>

    //Turf
    registerTurf(turfDetails: any): Promise<Turf | null>;
    getTurfs(companyId: string): Promise<Turf[] | null>;
    getTurfById(turfId: string): Promise<Turf | null>;
    deleteTurfImage(turfId: string, index: number): Promise<String[] | null>
    editTurf(turfDetails: any): Promise<Turf | null>
    blockTurf(turfId: string): Promise<object>
    unBlockTurf(turfId: string): Promise<object>


    //Slot
    getSlotsByDay(turfId: string, day: string, date: string): Promise<Slot[] | null>
    makeSlotUnavail(slotId: string, turfId: string): Promise<object>
    makeSlotAvail(slotId: string, turfId: string): Promise<object>
    addWorkingDays(turfId: string, payload: any): Promise<object>
    getDayDetails(turfId: string, day: string): Promise<object>;
    editDayDetails(turfId: string, updates: object): Promise<object>;


    ////// Chat //////
    createChatRoom(companyId: string, userId: string): Promise<ChatRoom>
    getChatLists(companyId: string): Promise<ChatRoom[] | null>;
    getChatMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoom } | null>;
    onSendMessage(companyId: string, userId: string, data: object): Promise<Message>

    /// <- Notificaitons -> ///
    getNotifications(userId: string): Promise<Notification[] | null>;
    updateNotifications(data: object): Promise<Notification[] | null>;
    deleteNotifications(roomId: string, userId: string): Promise<object>

    /// <- Dashboard -> ///
    getDashboardData(companyId: string): Promise<any>
    getMonthlyRevenue(companyId: string): Promise<any>
    getRevenueByRange(companyId: string, fromDate: Date, toDate: Date): Promise<any>
    getOverallRevenueByTurf(companyId: string, turfId: string): Promise<any>;

    // updateProfileImage(_id: string, url: string): Promise<User | null>
    // userLogin(email: string, password: string): Promise<User | null>
    // updateProfileDetails(_id: string, data: string): Promise<User | null>
    // forgotPassword(email: string): Promise<void>
    // updatePassword(email: string, password: string): Promise<User | null>
}
