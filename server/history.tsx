import fs from 'fs';

class History {
  logPath: string;

  constructor(_logPath: string) {
    this.logPath = _logPath;
  }

  async makeLog(message: string, object?: object): Promise<boolean> {
    const currentDate: Date = new Date(Date.now());

    try {
      const stream = fs.createWriteStream(this.logPath, { flags: 'a' });
      stream.write(
        `[${currentDate.toUTCString()}] ${message}`
        + (object ? ` | <${JSON.stringify(object)}>\n` : '\n')
      );
      stream.end();
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }
}

export default History;
