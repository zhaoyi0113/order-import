const mongoose = require('mongoose');

// order data schema
const orderSchema = mongoose.Schema({
  orderId: String,
  customerId: String,
  item: String,
  quantity: Number,
});

const OrderModel = mongoose.model('Orders', orderSchema);

module.exports = OrderModel;
