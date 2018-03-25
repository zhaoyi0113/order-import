const fs = require('fs');
const {Transform} = require('stream');
const mongoose = require('mongoose');

const DBWriter = require('./db-writer');

/**
 * control the read write stream pipeline
 */
class Controller {
  constructor(url, options = {}) {
    // connect to mongodb instance
    mongoose.connect(url, options);
  }
  /**
   * start read csv file
   * @param {*} url
   */
  process(url) {
    return new Promise((resolve, reject) => {
      const dbWriter = new DBWriter();
      const s = fs.createReadStream(url, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
      });

      s.on('error', err => reject(err));
      s.pipe(dbWriter).on('finish', () => {
        console.log('Import orders completed!');
        resolve();
      });
    });
  }
}

module.exports = Controller;
