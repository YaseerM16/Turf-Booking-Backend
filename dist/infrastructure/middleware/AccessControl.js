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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModel_1 = __importDefault(require("../database/models/UserModel"));
const CompanyModel_1 = __importDefault(require("../database/models/CompanyModel"));
class AccessControlMiddleware {
    /**
     * Check if a user's account is blocked
     */
    isUserBlocked(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
                // console.log("Req User in AccessControl :", req.user);
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized: No user ID provided." });
                    return;
                }
                const user = yield UserModel_1.default.findById(userId).select('isActive').lean();
                if (!user) {
                    res.status(404).json({ message: "User not found." });
                    return;
                }
                if (!(user === null || user === void 0 ? void 0 : user.isActive)) {
                    res.status(403).json({ message: "Access denied: Your account is blocked." });
                    return;
                }
                next();
            }
            catch (error) {
                console.error("Error checking user blocked status:", error);
                res.status(500).json({ message: "Internal server error." });
                return;
            }
        });
    }
    isCompanyBlocked(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const companyId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id; // Retrieve company ID from request
                if (!companyId) {
                    res.status(401).json({ message: "Unauthorized: No company ID provided." });
                    return;
                }
                const company = yield CompanyModel_1.default.findById(companyId).select('isActive').lean();
                if (!company) {
                    res.status(404).json({ message: "Company not found." });
                    return;
                }
                if (!(company === null || company === void 0 ? void 0 : company.isActive)) {
                    res.status(403).json({ message: "Access denied: Your company account is inactive." });
                    return;
                }
                next(); // Proceed if the company is active
            }
            catch (error) {
                console.error("Error checking company inactive status:", error);
                res.status(500).json({ message: "Internal server error." });
                return;
            }
        });
    }
}
exports.default = new AccessControlMiddleware();
