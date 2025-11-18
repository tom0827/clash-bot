export class DateUtils {
  static currentMonthIndexInEastern() {
    const now = new Date();
    const month =
      new Date(
        now.toLocaleString("en-US", { timeZone: "America/New_York" })
      ).getMonth() + 1;
    return month;
  }

  static currentStartOfDayInEastern() {
    const now = new Date();
    const easternDate = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    easternDate.setHours(0, 0, 0, 0);
    return easternDate;
  }

  static toExtendedISO(basic) {
    const extendedISO = basic.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/,
      "$1-$2-$3T$4:$5:$6.$7Z"
    );
    return new Date(extendedISO);
  }
}
