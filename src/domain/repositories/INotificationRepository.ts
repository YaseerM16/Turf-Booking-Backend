
export interface INotificationRepository {
    getNotifications(id: string, type: string): Promise<Notification[] | null>;
    updateNotifications(data: any, type: string): Promise<Notification[] | null>;
    deleteNotifications(roomId: string, id: string, type: string): Promise<object>;
}
