"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayValue = exports.DayRank = void 0;
var DayRank;
(function (DayRank) {
    DayRank[DayRank["Monday"] = 1] = "Monday";
    DayRank[DayRank["Tuesday"] = 2] = "Tuesday";
    DayRank[DayRank["Wednesday"] = 3] = "Wednesday";
    DayRank[DayRank["Thursday"] = 4] = "Thursday";
    DayRank[DayRank["Friday"] = 5] = "Friday";
    DayRank[DayRank["Saturday"] = 6] = "Saturday";
    DayRank[DayRank["Sunday"] = 7] = "Sunday";
})(DayRank || (exports.DayRank = DayRank = {}));
exports.DayValue = {
    [DayRank.Monday]: "Monday",
    [DayRank.Tuesday]: "Tuesday",
    [DayRank.Wednesday]: "Wednesday",
    [DayRank.Thursday]: "Thursday",
    [DayRank.Friday]: "Friday",
    [DayRank.Saturday]: "Saturday",
    [DayRank.Sunday]: "Sunday",
};
