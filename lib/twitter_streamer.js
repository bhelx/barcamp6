var twitter   = require('../lib/twitter_client')
  , Models    = require('../models')c
  , Tweet     = Models.Tweet
  , Settings  = Models.Settings
  ;

var tags = ['#barcampnola', '#bearcamp', '#bearcampnola', '#nolatech', '#nola'];

module.exports = {
  start: function (onNewTweet) {
    twitter
      .stream('statuses/filter', { track: tags.join(',') }, function (stream) {
        stream.on('data', function (twitter_obj) {

  debugger;
          var tweet = Tweet.build(twitter_obj);
          tweet.save(function (err) {
            if (err) return console.log(err);

            onNewTweet(tweet);
          });
        });
        stream.on('error', function (err) {
          console.log(err);
        });
      });
  }
};
