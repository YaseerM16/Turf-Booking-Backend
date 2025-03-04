"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Turf = void 0;
class Turf {
    constructor(companyId, turfName, address, description, turfSize, turfType, price, images, facilities, supportedGames, location, workingSlots, generatedSlots, isDelete, isActive, isBlocked, createdAt, updatedAt, _id) {
        this.companyId = companyId;
        this.turfName = turfName;
        this.address = address;
        this.description = description;
        this.turfSize = turfSize;
        this.turfType = turfType;
        this.price = price;
        this.images = images;
        this.facilities = facilities;
        this.supportedGames = supportedGames;
        this.location = location;
        this.workingSlots = workingSlots;
        this.generatedSlots = generatedSlots;
        this.isDelete = isDelete;
        this.isActive = isActive;
        this.isBlocked = isBlocked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this._id = _id;
    }
}
exports.Turf = Turf;
