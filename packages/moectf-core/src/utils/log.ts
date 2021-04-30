// FAREASTCTF MODIFICATION
import fs from 'fs-extra';

const log = async (
  path: string,
  info: Record<string, any>
): Promise<boolean> => {
  await fs.ensureFile(path);
  const success = await new Promise<boolean>((resolve) => {
    fs.appendFile(path,
      `${JSON.stringify(info)}\n`,
      (error) => {
        if (error) {
          console.error(error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
  });

  return success;
};

export default log;
