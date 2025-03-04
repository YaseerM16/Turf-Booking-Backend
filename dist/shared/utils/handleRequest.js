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
exports.RequestCallback = void 0;
const responseUtil_1 = require("./responseUtil");
const StatusCode_1 = require("../enums/StatusCode");
const RequestCallback = (controllerMethod) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("HANDling REQuest :::: ");
            yield controllerMethod(req, res);
        }
        catch (error) {
            // Handle error (you can customize this part)
            console.error("Error while handling common Request :", error);
            (0, responseUtil_1.sendResponse)(res, false, "Something went wrong with the Request :", StatusCode_1.StatusCode.INTERNAL_SERVER_ERROR);
        }
    });
};
exports.RequestCallback = RequestCallback;
