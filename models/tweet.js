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

TweetSchema.statics.topFiveTags = function (done) {
  Tweet.aggregate(
    { $project: { tags: 1 } },
    { $unwind: "$tags" },
    { $project: { tags: { $toLower: "$tags"} } },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5},
    done
  );
};

TweetSchema.statics.topFiveTagsNormalized = function (done) {
   this.topFiveTags(function(err,tags) {
      var totalTweats = 0;
      for (var i = 0; i < tags.length; i++) {
        totalTweats += tags[i].count;
      }
      for (var i = 0; i < tags.length; i++) {
        tags[i].count = tags[i].count / totalTweats;
      }
      done(err,tags);     
    });
}

TweetSchema.statics.topFiveTagsFiltered = function (hashTags, done) {
  Tweet.aggregate(
    { $project: { tags: 1 } },
    { $unwind: "$tags" },
    { $match: { tags: { $in: hashTags} } },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5},
    done
  );
}

TweetSchema.statics.topFiveTagsNormalizedFiltered = function (hashTags, done) {
   this.topFiveTagsFiltered(hashTags, function(err,tags) {
      var totalTweats = 0;
      for (var i = 0; i < tags.length; i++) {
        totalTweats += tags[i].count;
      }
      for (var i = 0; i < tags.length; i++) {
        tags[i].count = tags[i].count / totalTweats;
      }
      done(err,tags);     
    });
}

TweetSchema.statics.tagLeaderboard = function (tag,done) {
  this.aggregate(
    { $project: { tags: 1, user: 1 } },
    { $unwind: "$tags" },
    { $match: { tags: tag } },
    { $group: { _id : "$user", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    done
  );
}

module.exports = mongoose.model('Tweet', TweetSchema);
