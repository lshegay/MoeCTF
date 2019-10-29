import fs from 'fs-extra';
import moment, { Moment } from 'moment';

class Logger {
  logPath: string;

  /**
   * Creates an instance of Logger.
   * @param {string} path Absolute or relative path of a log file
   * @memberof Logger
   */
  constructor(path: string) {
    this.logPath = path;
  }

  /**
   * Makes another log message and appends it to the log file.
   * @param {string} message Any text.
   * @param {object} [object] Additional informaton.
   * @returns {Promise<boolean>} Returns if log was appended successfully.
   * @memberof Logger
   */
  async makeLog(message: string, object?: object): Promise<boolean> {
    const currentDate: Moment = moment();
    const dumpedObject: string = object ? ` | <${JSON.stringify(object)}>` : '';
    let success = false;

    await fs.ensureFile(this.logPath);
    fs.appendFile(this.logPath,
      `[${currentDate.toLocaleString()}] ${message}${dumpedObject}\n`,
      (error) => {
        if (error) {
          console.error(error);
        } else {
          success = true;
        }
      });

    return success;
  }
}

export default Logger;