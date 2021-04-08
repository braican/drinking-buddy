import fs from 'fs';
import path from 'path';

class FileLoader {
  static async load(id) {
    try {
      const data = fs.readFileSync(path.join(`${__dirname}/../../data/${id}.json`), 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return false;
    }
  }
}

export default FileLoader;
