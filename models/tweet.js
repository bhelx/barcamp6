var mongoose = require('mongoose')
  , _        = require('lodash')
  , Schema   = mongoose.Schema
  ;

var TweetSchema = new Schema({
    created_at : Date
  , tweet_id   : { type: Number, index: { unique: true, dropDups: true } }
  , text       : String
  , user       : Number
  , tags       : [String]
  , geo        : Schema.Type.Mixed
  , urls       : Array
  , user_mentions : Array
  , place_url  : String
  , place_full_name : String
  , 
});

TweetSchema.statics.build = function (twitter_obj) {
  var self = new this(twitter_obj);
  self.tweet_id = twitter_obj.id
  self.user = twitter_obj.user.id;
  self.tags = _.pluck(twitter_obj.entities.hashtags, 'text');
  self.urls = twitter_obj.entities.urls;
  self.user_mentions = tritter_obj.entities.user_mentions;
  self.place_url = twitter_obj.place.url;
  self.place_full_name = twitter_obj.place.full_name;
  if (twitter_obj.coordinates !== null) {
    self.coordinates.coordinates = twitter_obj.coordinates.coordinates;
    self.coordinates.types = twitter_obj.coordinates.types;
  }

  return self;
};

module.exports = mongoose.model('Tweet', TweetSchema);

