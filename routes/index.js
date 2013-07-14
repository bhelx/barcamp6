var Tweet = require('../models').Tweet;

exports.index = function(req, res){
  res.render('index', { title: 'Barcamp6' });
};

exports.topFive = function (req, res) {
  Tweet.tagStats(function (err, stats) {
    res.json({ stats: stats });
  });
};

exports.leaderboard = function (req, res) {
  Tweet.tagLeaderboard(req.params.tag, function (err, stats) {
    res.json({ stats: stats });
  });
};
