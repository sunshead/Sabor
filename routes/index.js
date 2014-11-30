
/*
 * GET home page.
 */

var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

exports.index = function(req, res){
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}
		res.render('index', {
			title: 'Homepage',
			posts : posts,
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
};

exports.user = function(req, res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', 'User does not exist');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				user : req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});
};

exports.post = function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', 'Successfully Posted');
		res.redirect('/u/' + currentUser.name);
	});
};

exports.reg = function(req, res) {
	res.render('reg', {
		title: 'Sign up',
		user : req.session.user,
		success : req.flash('success').toString(),
		error : req.flash('error').toString()
    });
};

exports.doReg = function(req, res) {
	//check passwords
    if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', 'Inconsistent Passwords');
		return res.redirect('/reg');
    }
  
    //create md5 code
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    var newUser = new User({
		name: req.body.username,
		password: password,
    });
    
    //check if the username already exist
	User.get(newUser.name, function(err, user) {
		if (user)
			err = 'Username already exists.';
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		//if does not exist, create a new user
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', 'Successfully Registered');
			res.redirect('/');
		});
	});
};

exports.login = function(req, res) {
	res.render('login', {
		title: 'Log in',
		user : req.session.user,
		success : req.flash('success').toString(),
		error : req.flash('error').toString()
    });
};

exports.doLogin = function(req, res) {
	//create hash value for passwords
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', 'User does not exist');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', 'Invalid Password');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', 'Successfully Logged In');
		res.redirect('/');
	});
};

exports.logout = function(req, res) {
	req.session.user = null;
    req.flash('success', 'Successfully Logged Out');
    res.redirect('/');
};
