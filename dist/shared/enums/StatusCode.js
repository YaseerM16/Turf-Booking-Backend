"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCode = void 0;
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["SUCCESS"] = 200] = "SUCCESS";
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCode[StatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCode[StatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
// const { ObjectId } = require("mongodb");
//             const companyTurfMap = [
//                 {
//                     companyId: "679dd2f01784dc019e8b7bae",
//                     turfIds: ["679dd4cd1784dc019e8b7bd6", "67a35941385120e32fb55e08"],
//                 },
//                 {
//                     companyId: "6759340f6f91c5124df38cd4",
//                     turfIds: [
//                         "6780f4a51e29c1a94ea7fb38",
//                         "6780f4f31e29c1a94ea7fbb0",
//                         "6780f5401e29c1a94ea7fc65",
//                         "6780f57b1e29c1a94ea7fd27",
//                         "67c29cff501b5021a1c3751e",
//                     ],
//                 },
//             ];
//             const getRandomDate = () => {
//                 const now = new Date();
//                 const pastThreeMonths = new Date();
//                 pastThreeMonths.setMonth(now.getMonth() - 3);
//                 return new Date(
//                     pastThreeMonths.getTime() + Math.random() * (now.getTime() - pastThreeMonths.getTime())
//                 );
//             };
//             const getRandomSlot = () => {
//                 const slots = [
//                     "6:00 AM - 7:00 AM",
//                     "8:00 AM - 9:00 AM",
//                     "10:00 AM - 11:00 AM",
//                     "2:00 PM - 3:00 PM",
//                     "4:00 PM - 5:00 PM",
//                     "6:00 PM - 7:00 PM",
//                 ];
//                 return slots[Math.floor(Math.random() * slots.length)];
//             };
//             const generateBookings = (count: any) => {
//                 const bookings = [];
//                 for (let i = 0; i < count; i++) {
//                     const company = companyTurfMap[Math.floor(Math.random() * companyTurfMap.length)];
//                     const turfId = company.turfIds[Math.floor(Math.random() * company.turfIds.length)];
//                     const date = getRandomDate();
//                     const slot = getRandomSlot();
//                     const price = Math.floor(Math.random() * (1000 - 300) + 300);
//                     const userId = new ObjectId();
//                     bookings.push({
//                         _id: new ObjectId(),
//                         userId: userId,
//                         companyId: new ObjectId(company.companyId),
//                         turfId: new ObjectId(turfId),
//                         selectedSlots: [
//                             {
//                                 _id: new ObjectId(),
//                                 turfId: new ObjectId(turfId),
//                                 day: date.toLocaleString("en-US", { weekday: "long" }),
//                                 date: date,
//                                 slot: slot,
//                                 isBooked: true,
//                                 isCancelled: false,
//                                 isRefunded: false,
//                                 price: price,
//                             },
//                         ],
//                         totalAmount: price * 0.9,
//                         status: "completed",
//                         paymentStatus: "completed",
//                         paymentMethod: "wallet",
//                         paymentTransactionId: Math.random().toString(36).substring(7),
//                         bookingDate: date,
//                         isRefunded: false,
//                         userDetails: {
//                             name: "User" + Math.floor(Math.random() * 1000),
//                             email: `user${Math.floor(Math.random() * 1000)}@example.com`,
//                             phone: "1234567890",
//                         },
//                         isActive: true,
//                         createdAt: date,
//                         updatedAt: date,
//                         __v: 0,
//                     });
//                 }
//                 return bookings;
//             };
//             await BookingModel.insertMany(generateBookings(50))
