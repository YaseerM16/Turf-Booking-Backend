export enum DayRank {
    Monday = 1,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}

export const DayValue = {
    [DayRank.Monday]: "Monday",
    [DayRank.Tuesday]: "Tuesday",
    [DayRank.Wednesday]: "Wednesday",
    [DayRank.Thursday]: "Thursday",
    [DayRank.Friday]: "Friday",
    [DayRank.Saturday]: "Saturday",
    [DayRank.Sunday]: "Sunday",
} as const;


export type PaymentData = {
    txnid: string;
    amount: string;
    productinfo: string;
    name: string;
    email: string;
    udf1: string;
    udf2: string;
    udf3: string;
    udf4: string;
    udf5: string;
    udf6: string;
    udf7: string;
};
