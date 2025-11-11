/**
 * Command Logger
 * Logs command executions with timestamps and duration tracking
 */

export class CommandLogger {
  static async logCommand(commandName, commandFunction, ...args) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] 🚀 Starting command: ${commandName}`);

    try {
      const result = await commandFunction(...args);
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endTimestamp = new Date().toISOString();
      console.log(
        `[${endTimestamp}] ✅ Command completed: ${commandName} (${duration}ms)`
      );
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endTimestamp = new Date().toISOString();
      console.log(
        `[${endTimestamp}] ❌ Command failed: ${commandName} (${duration}ms) - ${error.message}`
      );
      throw error;
    }
  }
}
