import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  static logError(error, req) {
    const logFile = path.join(__dirname, "error.log");
    const now = new Date().toISOString();
    let logLine = `[${now}]`;
    if (req) {
      logLine += ` [${req.method}] ${req.url}`;
    }
    logLine += ` - ${error.stack || error}`;
    fs.appendFile(logFile, logLine + "\n", "utf8", (err) => {
      if (err) console.error("فشل في تسجيل الخطأ:", err);
    });
  }
}

export default Logger;
