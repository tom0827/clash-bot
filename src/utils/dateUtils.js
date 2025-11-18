export class DateUtils {
  static currentMonthIndexInEastern() {
    const now = new Date();
    const month =
      new Date(
        now.toLocaleString("en-US", { timeZone: "America/New_York" })
      ).getMonth() + 1;
    return month;
  }
}
