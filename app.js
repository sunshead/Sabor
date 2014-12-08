var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var sock= require('./models/socket');
var fs = require('fs');

// ensure uploads directory is created

if (!fs.existsSync('./uploads')) {
  fs.mkdir('./uploads');
}

var sessionStore = new MongoStore({
  url: settings.connectionString
}, function() {
  console.log('connect mongodb success...');
});

var app = express();

// all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(flash());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookie_secret,
  key: settings.db,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: sessionStore
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var server = http.createServer(app);
var io = require('socket.io').listen(server);
//socket correspondence
//execute the socket module
sock(io);

server.listen(app.get('port'), app.get('ip'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

routes(app);
