var express           = require('express')
  , routes            = require('./routes')
  , http              = require('http')
  , path              = require('path')
  , sass              = require('node-sass')
  , passport          = require('passport')
  , TwitterStrategy   = require('passport-twitter').Strategy
  , partials          = require('express-partials')
  , io                = require('socket.io')
  , mongoose          = require('mongoose')
  , socketIo          = require('socket.io')
  , connectAssets     = require("connect-assets")
  , sockets           = require('./sockets')
  , models            = require('./models')
  , User              = models.User
  ;

var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

passport.serializeUser(function(user, done) {
  done(null, user.uid);
});

passport.deserializeUser(function(uid, done) {
  User.findOne({uid: uid}, function (err, user) {
    done(err, user);
  });
});

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://"+process.env.DOMAIN+"/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({uid: profile.id}, function(err, user) {
      if (user) {
        done(null, user);
      } else {
        var user = new User();
        user.provider = "twitter";
        user.uid = profile.id;
        user.name = profile.displayName;
        user.image = profile._json.profile_image_url;
        user.save(function(err) {
          if(err) { throw err; }
          done(null, user);
        });
      }
    });
  }
));

var app = express();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.use(
    sass.middleware({
        src         : __dirname + '/assets/sass'
      , dest        : __dirname + '/public'
      , debug       : true
      , force       : true
    })
  );
}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser(process.env.COOKIE_SECRET || 'barcampz'));
app.use(express.session());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// use the connect assets middleware for Snockets sugar
app.use(connectAssets());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/tag_stats', routes.tagStats);
app.get('/leaderboard', routes.leaderboard);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
  });

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('Visit: http://127.0.0.1:' + app.get('port'));
});

// Socket.io setup
var io = socketIo.listen(server)

sockets(io);

