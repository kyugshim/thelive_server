const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    tag: String,
    image : { 
      data : Buffer,
      contentsType : String
    },
    quantity: { type: Number,required: true },
    user_id : { type: Number, ref: user },
    broadcast_id :{ type: Number, ref: broadcast }
  });
  
  module.exports = mongoose.model('product', productSchema);