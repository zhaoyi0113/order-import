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
    const {idLines, customerIds} = this.parseData(lines);
    this.queryCustomers(customerIds)
      .then(results => {
        const orders = this.createOrders(results, idLines);
        if (orders.length > 0) {
          // do a batch insert
          OrderModel.insertMany(orders)
            .then(() => {
              console.log(`Import ${orders.length} orders`);
              callback();
            })
            .catch(err => console.error(err));
        } else {
          callback();
        }
      })
      .catch(err => console.error(err));
  }

  /**
   * parse string array to orders
   *
   * @param {*} lines	the array of order string
	 * @returns	idLines: the map between custoer id and order string
	 * 					customerIds: all customer ids in an array
   */
  parseData(lines) {
    const customerIds = [];
    const idLines = {};
    lines.forEach((line, i) => {
      if (line.indexOf('orderId') >= 0) {
        // this is header line, skip
        return;
      }
      const items = line.split(',');
      if (items.length > 3 && items[1].length > 0) {
        customerIds.push(items[1]);
        idLines[items[1]] = line;
      } else {
        this.leftChunks = line;
      }
    });
    return {idLines, customerIds};
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
	 * @param {} idLines	 the object which key is the customer id and value are the order data
	 */
  createOrders(matchedCustomers, idLines) {
    const orders = [];
    if (!matchedCustomers || matchedCustomers.length === 0) {
      // not find, skip
      return orders;
      return;
    }
    matchedCustomers.forEach(res => {
      if (idLines[res.customerId]) {
				const items = idLines[res.customerId].split(',');
				
        const order = new OrderModel({
          orderId: items[0].trim(),
          customerId: items[1].trim(),
          item: items[2].trim(),
          quantity: parseInt(items[3].trim()),
        });
        orders.push(order);
      }
    });
    return orders;
  }
}

module.exports = DBWriter;
