var MongoClient = require('mongodb').MongoClient

var settings = require('../settings')

var instance

function db(callback) {
  if (instance == null) {
    MongoClient.connect(settings.connectionString, function (err, db) {
      if (err) {
        throw new Error('Failed to connect to database: ' + err.errmsg)
      } else {
        instance = db
        callback(instance)
      }
    })
  } else {
    callback(instance)
  }
}

db.close = function () {
  instance.close()
  instance = null
}

module.exports = db
