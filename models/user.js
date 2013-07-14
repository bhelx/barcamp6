var mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  ;

var UserSchema = new Schema({
  provider: String,
  uid: String,
  name: String,
  image: String,
  created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);

