export interface INotificationUseCase {
    /// <- Notificaitons -> ///
    getNotifications(id: string, type: string): Promise<Notification[] | null>;
    updateNotifications(data: object, type: string): Promise<Notification[] | null>;
    deleteNotifications(roomId: string, id: string, type: string): Promise<object>;
}