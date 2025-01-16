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
