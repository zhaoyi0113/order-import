const mongoose = require('mongoose');

/**
 * create options on database
 *
 * @param {*} url the datsbase url
 * @param {*} options 	configuration for connection
 */
const connectDB = (url, options = {}) => {
  mongoose.connect(url, options);
};

module.exports = {connectDB};
