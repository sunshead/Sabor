
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
						db : settings.db
					}, function() {
							console.log('connect mongodb success...');
					});


var app = express();
// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/sabor';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

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


/**
* node-mongodb-native   https://github.com/christkv/node-mongodb-native
* 
* ejs	https://github.com/visionmedia/ejs
* 
* express-Migrating from 2.x to 3.x		https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x
* 
* Express 3.x + Socket.IO		http://blog.lyhdev.com/2012/07/nodejs-express-3x-socketio.html
* 
* express-partials		https://github.com/publicclass/express-partials
* 
* connect-flash		https://github.com/jaredhanson/connect-flash
*
* connect-mongodb		https://github.com/masylum/connect-mongodb
*
* 
*/
