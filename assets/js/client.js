//=require socket.io
//=require jquery

didDisconnect = false

$(window).ready(function(){

  socket = io.connect()

  socket.on("connection", function(data){
    if( didDisconnect ) {
      window.location = window.location.pathname;
    } else {
      var li = $("<li>"+data+"</li>");
      $("#socket-stream").append(li);
      socket.emit("ripp-it", "croak");
    }
  });

  socket.on("tweet", function(data){
    var li = $("<li>"+data.text+"</li>");
    $("#socket-stream").append(li);
  });

  socket.on("disconnect", function(data){
    didDisconnect = true;
  });
  
});
