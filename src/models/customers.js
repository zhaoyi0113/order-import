const mongoose = require('mongoose');

// customers data schema
const customersSchema = mongoose.Schema({
  customerId: String,
  firstName: String,
  lastName: String,
});

const CustomersModel = mongoose.model('Customers', customersSchema);

module.exports = CustomersModel;