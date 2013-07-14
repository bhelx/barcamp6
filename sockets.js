var mongoose = require('mongoose')
  , models   = require('./models')
  , Tweet   = models.Tweet
;

module.exports = function(io) {

  var stream = Tweet.find().tailable().limit(10).stream();

  stream.on('error', function (err) {
    console.error(err)
  });

  stream.on('data', function (doc) {
    io.sockets.emit("tweet", doc);
  });

  io.configure('production', function (){
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set('log level', 1);
  });

  io.configure('development', function (){
    // whatever!!!
  });

  io.sockets.on('connection', function(socket) {
    socket.emit("connection", "yummyPizza");
  });

}
