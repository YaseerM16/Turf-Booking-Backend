"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationUseCase = void 0;
const StatusCode_1 = require("../../shared/enums/StatusCode");
const errors_1 = require("../../shared/utils/errors");
class NotificationUseCase {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    getNotifications(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id || !type)
                    throw new errors_1.ErrorResponse("Id or type is not getting While try to Get Notifications.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                return yield this.notificationRepository.getNotifications(id, type);
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    updateNotifications(data, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data || !type)
                    throw new errors_1.ErrorResponse("data for notification update is not getting While try to Update Notifications.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                return yield this.notificationRepository.updateNotifications(data, type);
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
    deleteNotifications(roomId, id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("roomId :", roomId, "Id :", id, "type :", type);
                if (!roomId || !id || !type)
                    throw new errors_1.ErrorResponse("data for notification update is not getting While try to Update Notifications.. !!", StatusCode_1.StatusCode.BAD_REQUEST);
                return yield this.notificationRepository.deleteNotifications(roomId, id, type);
            }
            catch (error) {
                throw new errors_1.ErrorResponse(error.message, error.status);
            }
        });
    }
}
exports.NotificationUseCase = NotificationUseCase;
