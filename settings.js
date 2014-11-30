var env = process.env
var connectionString

if (env.OPENSHIFT_APP_NAME) {
  connectionString = env.OPENSHIFT_MONGODB_DB_URL + env.OPENSHIFT_APP_NAME
} else {
  connectionString = 'mongodb://admin:1234@127.0.0.1:27017/realtime'
}

module.exports = {
  cookie_secret : 'secret_meteoric',
  connectionString: connectionString
}
