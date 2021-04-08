const fs = require('fs');
const path = require('path');

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

module.exports = FileLoader;
