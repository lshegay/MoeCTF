// FAREASTCTF MODIFICATION
import fs from 'fs-extra';

const log = async (path: string, message: string, object?: Record<string, any>): Promise<boolean> => {
  const currentDate: Date = new Date(Date.now());
  const realObject = object as Record<string, any>;
  let success = false;

  await fs.ensureFile(path);
  fs.appendFile(path,
    `${JSON.stringify({
      date: currentDate.toLocaleString(),
      timestamp: currentDate.getTime(),
      ...realObject,
    })}\n`,
    (error) => {
      if (error) {
        if (error) throw error;
      } else {
        success = true;
      }
    });

  return success;
};

export default log;
