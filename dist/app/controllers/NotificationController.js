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
exports.NotificationController = void 0;
const responseUtil_1 = require("../../shared/utils/responseUtil");
const StatusCode_1 = require("../../shared/enums/StatusCode");
// import { NotificationUseCase } from "../useCases/NotificationUseCase";
// import { sendResponse } from "../utils/responseHandler";
// import { StatusCode } from "../utils/statusCodes";
class NotificationController {
    constructor(notificationUseCase) {
        this.notificationUseCase = notificationUseCase;
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { type } = req.query;
                console.log("Get_NOtify");
                const notifications = yield this.notificationUseCase.getNotifications(id, type);
                (0, responseUtil_1.sendResponse)(res, true, "Notifications fetched successfully", StatusCode_1.StatusCode.SUCCESS, { notifications });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type } = req.query;
                const updatedNotifications = yield this.notificationUseCase.updateNotifications(req.body, type);
                (0, responseUtil_1.sendResponse)(res, true, "Notifications updated successfully", StatusCode_1.StatusCode.SUCCESS, { notifications: updatedNotifications });
            }
            catch (error) {
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roomId, id } = req.params; // `id` can be userId or companyId
                const { type } = req.query;
                const updatedNotifications = yield this.notificationUseCase.deleteNotifications(roomId, id, type);
                (0, responseUtil_1.sendResponse)(res, true, "Notification deleted successfully", StatusCode_1.StatusCode.SUCCESS, { notifications: updatedNotifications });
            }
            catch (error) {
                // console.log("This is ERRR insdie delNotify : ", error);
                (0, responseUtil_1.sendResponse)(res, false, error.message, StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.NotificationController = NotificationController;
