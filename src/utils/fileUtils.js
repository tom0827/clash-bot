/**
 * File Utilities
 * Handles file operations for data storage
 */

import { writeFile } from "fs/promises";

export class FileManager {
  static async saveAsJSON(data, name, directory = ".") {
    const safeTag = name.replace(/[^\w-]/g, "");
    const filename = `${directory}/${safeTag}.json`;
    await writeFile(filename, JSON.stringify(data, null, 2), "utf8");
    return filename;
  }
}