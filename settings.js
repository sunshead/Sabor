module.exports = {
	cookie_secret : 'secret_meteoric',
	db : 'sabor',
	host : process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost',
	port : process.env.OPENSHIFT_NODEJS_PORT || 27017
}