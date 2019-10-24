import fs from 'fs';
import moment, { Moment } from 'moment';

class History {
  logPath: string;

  /**
   * Creates an instance of History.
   * @param {string} path Absolute or relative path of a log file
   * @memberof History
   */
  constructor(path: string) {
    this.logPath = path;
  }

  /**
   * Makes another log message and appends it to the log file.
   * @param {string} message Any text.
   * @param {object} [object] Additional informaton.
   * @returns {boolean} Returns if log was appended successfully.
   * @memberof History
   */
  makeLog(message: string, object?: object): boolean {
    const currentDate: Moment = moment();
    const dumpedObject: string = object ? ` | <${JSON.stringify(object)}>` : '';
    let success = false;

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

export default History;
