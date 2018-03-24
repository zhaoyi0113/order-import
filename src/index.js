const Controller = require('./controller');
const config = require('config-yml');
const {OrderModel, CustomersModel} = require('./models');

const env = process.env.NODE_ENV || 'dev';
const {url, options} = config[env].db;
const ctr = new Controller(url, options);

ctr
  .process('./data/orders.csv')
  .then(() => process.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
