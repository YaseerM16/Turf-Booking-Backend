"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
class Slot {
    constructor(turfId, day, date, slot, isBooked = false, _id) {
        this.turfId = turfId;
        this.day = day;
        this.date = date;
        this.slot = slot;
        this.isBooked = isBooked;
        this._id = _id;
    }
}
exports.Slot = Slot;
