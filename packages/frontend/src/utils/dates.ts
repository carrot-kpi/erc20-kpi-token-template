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
