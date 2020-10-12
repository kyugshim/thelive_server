const mongoose = require('mongoose');
const user  = require('./user');
const product  = require('./product');

const orderSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    customer_id : { type: Number, ref: user },
    product_id :{ type: Number, ref: product },
    payment_status: {type: String , default: 'prepare'},
    order_quantity: Number,
    address: { type: String, required: true, trim: true},
    customer_phone: {type: Number, ref: user}
  });
  
  module.exports = mongoose.model('order', orderSchema);