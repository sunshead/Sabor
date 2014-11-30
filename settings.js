var env = process.env
var connectionString

if (env.OPENSHIFT_APP_NAME) {
  connectionString = env.OPENSHIFT_MONGODB_DB_URL + env.OPENSHIFT_APP_NAME
} else {
  connectionString = 'mongodb://127.0.0.1:27017/sabor'
}

module.exports = {
  cookie_secret : 'secret_meteoric',
  connectionString: connectionString
}
