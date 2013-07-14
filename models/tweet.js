var mongoose = require('mongoose')
  , _        = require('lodash')
  , Schema   = mongoose.Schema
  ;

var TweetSchema = new Schema({
    created_at : Date
  , tweet_id   : { type: Number, index: { unique: true, dropDups: true } }
  , text       : String
  , user       : { id: Number, name: String, image: String, screen_name: String }
  , tags       : [String]
}, {
  capped: { size: 1024, max: 1000, autoIndexId: true }
});

TweetSchema.statics.build = function (twitter_obj) {
  var self = new this(twitter_obj);

  self.tweet_id = twitter_obj.id
  self.user = { 
    id: twitter_obj.user.id, 
    name: twitter_obj.user.name, 
    image: twitter_obj.user.profile_image_url,
    screen_name: twitter_obj.user.screen_name
  };
  self.tags = _.pluck(twitter_obj.entities.hashtags, 'text');

  return self;
};


TweetSchema.statics.tagStats = function (done) {
  Tweet.aggregate(
    { $project: { tags: 1 } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { tags: 1 } },
    done
  );
};

TweetSchema.statics.tagLeaderboard = function (tag,done) {
  Tweet.aggregate(
    { $project: { tags: 1, user: 1 } },
    { $unwind: "$tags" },
    { $match: { tags: tag } },
    { $group: { _id : "$user", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit : 3 },
    done
  );
}



module.exports = mongoose.model('Tweet', TweetSchema);

