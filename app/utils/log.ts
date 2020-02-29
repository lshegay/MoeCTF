import fs from 'fs-extra';

const log = async (path: string, message: string, object?: object): Promise<boolean> => {
  const currentDate: Date = new Date(Date.now());
  const dumpedObject: string = object ? ` | <${JSON.stringify(object)}>` : '';
  let success = false;

  await fs.ensureFile(path);
  fs.appendFile(path,
    `[${currentDate.toLocaleString()}] ${message}${dumpedObject}\n`,
    (error) => {
      if (error) {
        console.error(error);
      } else {
        success = true;
      }
    });

  return success;
};

export default log;
