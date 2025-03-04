"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
class Company {
    constructor(_id, googleId, companyname, companyemail, phone, password, isActive, isVerified, isBlocked, isApproved, profilePicture, verifyToken, verifyTokenExpiry, forgotPasswordToken, forgotPasswordTokenExpiry, location, address) {
        this._id = _id;
        this.googleId = googleId;
        this.companyname = companyname;
        this.companyemail = companyemail;
        this.phone = phone;
        this.password = password;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.isBlocked = isBlocked;
        this.isApproved = isApproved;
        this.profilePicture = profilePicture;
        this.verifyToken = verifyToken;
        this.verifyTokenExpiry = verifyTokenExpiry;
        this.forgotPasswordToken = forgotPasswordToken;
        this.forgotPasswordTokenExpiry = forgotPasswordTokenExpiry;
        this.location = location;
        this.address = address;
    }
}
exports.Company = Company;
