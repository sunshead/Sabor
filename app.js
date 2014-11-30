
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var routes = require('./routes');

var settings = require('./settings');

var MongoStore = require('connect-mongo')(express);

var partials = require('express-partials');
var flash = require('connect-flash');

var sessionStore = new MongoStore({
  url: settings.connectionString
}, function() {
  console.log('connect mongodb success...');
});


var app = express();

app.configure(function(){
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
	app.set('ip', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');

	app.use(partials());
	app.use(flash());

	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.cookieParser());

	app.use(express.session({
		secret : settings.cookie_secret,
		cookie : {
			maxAge : 60000 * 20	//20 minutes
		},
		store : sessionStore
	}));

	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/u/:user', routes.user);
app.post('/post', routes.post);
app.get('/reg', routes.reg);
app.post('/reg', routes.doReg);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', routes.logout);


http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
