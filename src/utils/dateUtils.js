export class DateUtils {
    static currentMonthIndex() {
        const now = new Date();
        return now.getMonth() + 1; // 1-12
    }
}
