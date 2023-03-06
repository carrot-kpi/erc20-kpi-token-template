export const isInThePast = (date: Date) => {
    return date.getTime() < Date.now();
};

export const unixTimestamp = (date: Date) => {
    return Math.floor(date.getTime() / 1000);
};
