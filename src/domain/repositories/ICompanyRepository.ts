import { promises } from "dns";
import { Company } from "../entities/Company";
import { Slot } from "../entities/Slot";
import { Turf } from "../entities/Turf";
import { ChatRoom } from "../entities/ChatRoom";
import { Message } from "../entities/Message";

export interface ICompanyRepository {
    findByEmail(email: string): Promise<Company | null>;
    create(company: Company): Promise<Company>;
    update(id: string, value: any): Promise<Company | null>;


    //Turf
    registerTurf(turf: Turf, workingDays: string[]): Promise<Turf | null>;
    getTurfs(companyId: string): Promise<Turf[] | null>;
    getTurfById(turfId: string): Promise<Turf | null>;
    deleteTurfImage(turfId: string, index: number): Promise<String[] | null>;
    editTurfById(turfId: string, turf: Turf): Promise<Turf | null>;
    blockTurf(turfId: string): Promise<object>;
    unBlockTurf(turfId: string): Promise<object>;


    //Slot
    getSlotByDay(turfId: string, day: string, date: string): Promise<Slot[] | null>;
    makeSlotUnavail(slotId: string, turfId: string): Promise<object>;
    makeSlotAvail(slotId: string, turfId: string): Promise<object>;
    addWorkingDays(turfId: string, payload: any): Promise<object>;
    getDayDetails(turfId: string, day: string): Promise<object>;
    editDayDetails(turfId: string, updates: object): Promise<object>;

    ////// Chat //////
    createChatRoom(companyId: string, userId: string): Promise<ChatRoom>
    getChatRooms(companyId: string): Promise<ChatRoom[] | null>
    getChatMessages(roomId: string): Promise<{ messages: Message[], chat: ChatRoom } | null>
    onSendMessage(companyId: string, userId: string, data: object): Promise<Message>

    /// <- Notificaitons -> ///
    getNotifications(userId: string): Promise<Notification[] | null>;
    updateNotifications(data: any): Promise<Notification[] | null>
    deleteNotifications(roomId: string, userId: string): Promise<object>;

    /// <- DashBoard -> ///
    getDashboardData(companyId: string): Promise<any>
    getMonthlyRevenue(companyId: string): Promise<any>;
    getRevenueByRange(companyId: string, fromDate: Date, toDate: Date): Promise<any>;
    getOverallRevenueByTurf(companyId: string, turfId: string): Promise<any>;
}