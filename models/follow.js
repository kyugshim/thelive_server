const mongoose = require('mongoose');

const user  = require('./user');

const followSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    user_id : { type: Number, ref: user },
    follow_id :{ type: Number, ref: user }
  });
  
  module.exports = mongoose.model('follow', followSchema);