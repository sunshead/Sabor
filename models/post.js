var mongodb = require('./db');

function Post(username, post, time) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};
module.exports = Post;

Post.prototype.save = function save(callback) {
  // save into mongodb document
  var post = {
    user: this.user,
    post: this.post,
    time: this.time
  };

  mongodb(function(db) {
    db.collection('posts', function(err, collection) {
      //collection.ensureIndex('user');

      collection.insert(post, {safe: true}, function(err, post) {
	callback(err, post);
      });
    });
  });
};

Post.get = function get(username, callback) {
  mongodb(function (db) {
    db.collection('posts', function(err, collection) {
      //find documents whose user attribute is 'username', if null then match all
      var query = {};
      if (username) {
	query.user = username;
      }

      collection.find(query, {limit:9}).sort({time: -1}).toArray(function(err, docs) {
	if (err) {
	  callback(err, null);
	}

	var posts = [];

	docs.forEach(function(doc, index) {
	  var post = new Post(doc.user, doc.post, doc.time);
	  posts.push(post);
	});

	callback(null, posts);
      });
    });
  });
};
