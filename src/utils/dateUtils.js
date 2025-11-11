/**
 * Date Utilities
 * Helper functions for date operations
 */

export class DateUtils {
  static parseCoC(dateString) {
    // Converts '20251107T070000.000Z' -> '2025-11-07T07:00:00.000Z'
    return new Date(
      dateString.replace(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/,
        "$1-$2-$3T$4:$5:$6.$7Z"
      )
    );
  }

  static getCurrentDateString() {
    return new Date().toISOString().split("T")[0];
  }
}