import jsSHA from "jssha";
import { config } from "../../config/config";

export async function generatePaymentHash({
    txnid,
    amount,
    productinfo,
    username,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7
}: {
    txnid: string;
    amount: string;
    productinfo: string;
    username: string;
    email: string;
    udf1: string;
    udf2: string;
    udf3: string;
    udf4: string;
    udf5: string;
    udf6: string;
    udf7: string;
}) {
    try {
        // console.log("MErchndt Kay :", config.PAYU_MERCHANT_KEY)
        // console.log("Salt :", config.PAYU_SALT);

        const hashString = `${config.PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${username}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}||||${process.env.PAYU_SALT}`;
        // console.log("Hash String:", hashString);

        const sha = new jsSHA("SHA-512", "TEXT");
        sha.update(hashString);
        const hash = sha.getHash("HEX");
        // console.log("Generated Hash:", hash);

        const bookingData = {
            txnid,
            amount,
            productinfo,
            username,
            email,
            udf1,
            udf2,
            udf3,
            udf4,
            udf5,
            udf6,
            udf7,
            paymentStatus: "pending",
            paymentHash: hash,
        };
        // console.log(udf7, 'end');
        // console.log(udf4, 'start');


        // await this.userRepository.saveBooking(bookingData);
        return hash;
    } catch (error: any) {
        throw new Error(error);
    }
}