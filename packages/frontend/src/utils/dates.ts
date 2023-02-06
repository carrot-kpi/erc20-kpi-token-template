export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h24",
    }).format(date);
};

export const formatCountDownString = (timestamp: number) => {
    if (timestamp <= 0) {
        return "00D 00H 00M";
    }

    const daysLeft = timestamp / 1000 / 60 / 60 / 24;
    const hoursLeft = (timestamp / 1000 / 60 / 60) % 24;
    const minutesLeft = (timestamp / 1000 / 60) % 60;

    return `${Math.floor(daysLeft)}D ${Math.floor(hoursLeft)}H ${Math.floor(
        minutesLeft
    )}M`;
};
