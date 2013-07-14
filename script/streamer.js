var twitter   = require('../lib/twitter_client')
  , streamer  = require('../lib/twitter_streamer')
  , mongoose  = require('mongoose')
  ;

streamer.start(console.log);
