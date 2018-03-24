const {Writable} = require('stream');
const _ = require('lodash');
const {OrderModel, CustomersModel} = require('./models');

/**
 * write chunk of data from read stream to database
 */
class DBWriter extends Writable {
  constructor() {
    super();
    this.leftChunks = '';
  }

  /**
   * write chunk data to database
   *
   * @param {*} chunk
   * @param {*} encoding
   * @param {*} callback
   */
  _write(chunk, encoding, callback) {
    const chunkStr = chunk.toString();
    const lines = (this.leftChunks + chunkStr).split('\n');
    this.leftChunks = '';
    const {validOrders, customerIds} = this.parseData(lines);
    this.queryCustomers(customerIds)
      .then(results => {
        const orders = this.createOrders(results, validOrders);
        return OrderModel.insertMany(orders);
      })
      .then(o => {
        console.log(`Import ${o.length} orders`);
        callback();
      })
      .catch(err => console.error(err));
  }

  /**
   * parse string array to orders
   *
   * @param {*} lines	the array of order string
   * @returns	validLines: validate order data
   * 					customerIds: all customer ids in an array
   */
  parseData(lines) {
    const customerIds = [];
    const validOrders = [];
    lines.forEach((line, i) => {
      if (line.indexOf('orderId') >= 0) {
        // this is header line, skip
        return;
      }
      const items = line.split(',');
      if (items.length > 3 && items[1].length > 0) {
        customerIds.push(items[1]);
        validOrders.push({
          orderId: items[0].trim(),
          customerId: items[1].trim(),
          item: items[2].trim(),
          quantity: parseInt(items[3].trim(), 10),
        });
      } else {
        this.leftChunks = line;
      }
    });
    return {validOrders, customerIds};
  }

  /**
   * query whether order customer id exists in customer collection
   *
   * @param {*} customerIds
   */
  queryCustomers(customerIds) {
    const orders = [];
    return new Promise(resolve => {
      // check whether user id exists
      CustomersModel.find({customerId: {$in: customerIds}})
        .then(results => {
          const diff = _.difference(
            customerIds,
            results.map(r => r.customerId)
          );
          if (diff.length > 0) {
            console.error('Customer Id doesnt exist:', diff);
          }
          resolve(results);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }

  /**
   * create order model object
   * @param {} matchedCustomers the customer object from mongodb
   * @param {} validOrders	 valid order data
   */
  createOrders(matchedCustomers, validOrders) {
    let orderModels = [];
    if (!matchedCustomers || matchedCustomers.length === 0) {
      // not find, skip
      return orderModels;
    }
    matchedCustomers.forEach(res => {
			const orders = _.filter(validOrders, o => o.customerId === res.customerId);
      if (orders) {
        orderModels = orderModels.concat(orders.map(o => new OrderModel(o)));
      }
    });
    return orderModels;
  }
}

module.exports = DBWriter;
