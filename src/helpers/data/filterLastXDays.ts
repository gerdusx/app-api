export const filterLastXDays = (data: any[], datePropName: string, fromDate: number, days: number): any[] => {
    const cutoffDateTimestamp = fromDate - (days * 24 * 60 * 60 * 1000); // days in milliseconds

    return data.filter((item, index) => {
        const itemTimestamp = item[datePropName] * 1000; // Convert to milliseconds
        return itemTimestamp >= cutoffDateTimestamp && itemTimestamp <= fromDate;
    });
}