var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/barcamp6');

module.exports = {
    Tweet    : require('./tweet')
  , Settings : require('./settings')
  , User     : require('./user')
};
