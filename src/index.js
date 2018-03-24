const Controller = require('./controller');
const config = require('config-yml');
const {OrderModel, CustomersModel} = require('./models');

const env = process.env.NODE_ENV || 'dev';
const dbUrl = config[dev].db.url;
const ctr = new Controller(dbUrl);

ctr.process('./data/orders.csv');


// const {connectDB} = require('./dbwrapper');
// connectDB('mongodb://localhost/test');
// OrderModel.insertMany([new OrderModel({
// 	orderId: 'items[0]',
//           customerId: 'items[1]',
//           item: 'items[2]',
//           quantity: 324,
// })]);

// new OrderModel({
// 	orderId: 'items[0]',
//           customerId: 'items[1]',
//           item: 'items[2]',
//           quantity: 324,
// }).save();
// CustomersModel.findOne({customerId: '2'})
//   .then(ret => console.log('xx:', ret))
//   .catch(err => console.error(err));
