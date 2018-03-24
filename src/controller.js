const fs = require('fs');
const {Transform} = require('stream');

const dbWrapper = require('./dbwrapper');
const DBWriter = require('./db-writer');

/**
 * control the read write stream pipeline
 */
class Controller {
  constructor(dbUrl) {
    // connect to mongodb instance
    dbWrapper.connectDB(dbUrl);
  }
  /**
   * start read csv file
   * @param {*} url
   */
  process(url) {
    const dbWriter = new DBWriter();

    const s = fs
      .createReadStream(url, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
      })
      .pipe(dbWriter);
    s.on('finish', () => {
      console.log('Import orders completed!');
      process.exit();
    });
  }

}

module.exports = Controller;
