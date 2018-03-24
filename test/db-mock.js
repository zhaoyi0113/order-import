const mongoUnit = require('mongo-unit');
const dbData = require('./data/test.json');
const Controller = require('../src/controller');

// create mock mongodb instance and load test data
module.exports = () => {
  return new Promise((resolve, reject) => {
    let controller;
    mongoUnit
      .start()
      .then(url => (controller = new Controller(url)))
      .then(() => mongoUnit.load(dbData))
      .then(() => resolve(controller))
      .catch(err => reject(err));
  });
};
