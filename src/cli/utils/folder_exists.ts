import { access } from 'fs/promises';

export const folderExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
