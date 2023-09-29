export const sortTimestampByProp = (data: any[], propName: string, order: "asc" | "desc" = 'asc') => {
    return [...data].sort((a, b) => {
        if (order === 'asc') return a[propName] - b[propName];
        return b[propName] - a[propName];
    });
};