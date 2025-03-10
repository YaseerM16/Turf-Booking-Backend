"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(_id, googleId, name, email, phone, password, role, isActive, isVerified, isDelete, profilePicture, subscriptionPlan, verifyToken, verifyTokenExpiry, forgotPasswordToken, forgotPasswordTokenExpiry) {
        this._id = _id;
        this.googleId = googleId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.isDelete = isDelete;
        this.profilePicture = profilePicture;
        this.subscriptionPlan = subscriptionPlan;
        this.verifyToken = verifyToken;
        this.verifyTokenExpiry = verifyTokenExpiry;
        this.forgotPasswordToken = forgotPasswordToken;
        this.forgotPasswordTokenExpiry = forgotPasswordTokenExpiry;
    }
}
exports.User = User;
