var mongodb = require('./db')

function User(user) {
  this.name = user.name;
  this.password = user.password;
};

module.exports = User;

User.prototype.save = function save(callback) {
  var user = {
    name: this.name,
    password: this.password,
  };

  mongodb(function (db) {
    // get users collection
    db.collection('users', function(err, collection) {
      //save
      collection.insert(user, {safe: true}, function(err, user) {
	callback(err, user);
      });
    });
  })
};

User.get = function get(username, callback) {
  mongodb(function (db) {
    db.collection('users', function(err, collection) {
      //find
      collection.findOne({name: username}, function(err, doc) {
	if (doc) {
	  var user = new User(doc);
	  callback(err, user);
	} else {
	  callback(err, null);
	}
      });
    });
  });
};
