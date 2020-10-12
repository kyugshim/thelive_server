const mongoose = require('mongoose');



const broadcastSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    watching: { type: Number },
    status: String,
    user_id : { type: Number, ref: user },
    messages : Array,

    //tag: String, 추가하면 어떨까? 검색할떄 도움
  });
  
  module.exports = mongoose.model('broadcast', broadcastSchema);