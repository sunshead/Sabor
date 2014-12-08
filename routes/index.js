//get encoding module
var crypto = require('crypto');
var User = require('../models/user.js');
var fs = require('fs');

//get plugins for image processing
var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick : true });
var images = require("node-images");

module.exports = function(app){
	app.get('/',function(req,res){
      //since if log in successuful the info will be stored into session, so:
      //if user does not exist, render the login & signup page; if user exists, redirect to the main content page
      if(!req.session.user){
          res.render('index', {
              title:"Sabor",
              name:"Your gourmet microblog.",
              //can access through ejs template's locals.user
              user:req.session.user,
              //can access through ejs template's locals.error
              error: req.flash('error').toString(),
              //can access through ejs template's locals.success
              success: req.flash('success').toString()
          });
      }else{
          res.redirect('/mainpage');
      }
  });

  //logout request address
  app.get('/logout',function(req,res){
      req.session.user = null;
      req.flash('success','Log out successful.');
      res.redirect('/');
  });

  //login receive address
  app.post('/login',function(req,res){
     //encode the password get from post
      var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
      var newUser = new User({
        name: req.body.name,
        password: password
      });
      //search user
      User.get(newUser.name, function(err, user){
          if(user){
              //if user exist, return user info and compare passwords
              if(user.password != password){
                  req.flash('error','Incorrect password.');
                  res.redirect('/');
              }else{
                  req.session.user = user;
                  res.redirect('/mainpage');
              }
          }else{
              req.flash('error','User does not exist.');
              res.redirect('/');
          }
      });
  });
  //signup receive address
  app.post('/reg',function(req,res){
   //use 'req.body' to get name, password(*2) in the post request
    var name = req.body.name,
          password = req.body.password,
          password_re = req.body['repassword'];
        //check if two input passwords are the same
        if(password_re != password){
            //if not, record info into page notification flash, and then redirect to homepage
            req.flash('error','Inconsistent passwords.');
            return res.redirect('/');
        }
        //encode passwords
        var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
          name: req.body.name,
          password: password
        });

        //use 'user.get()' in the user module to get user info
        User.get(newUser.name, function(err, user){
            if(user){
              err = 'User already exists.';
            }
            if(err){
              req.flash('error', err);
              return res.redirect('/');
            }
            //use 'user.save()' in the user module to store user info
            newUser.save(function(err,user){
              if(err){
                req.flash('error',err);
                return res.redirect('/');
              }
              //store user info into req.session when success, and direct to the main content page
              req.session.user = user;
              req.flash('success','Sign up successful.');
              res.redirect('/mainpage');
            });
        });
  });
  //main content page
  app.get('/mainpage',function(req,res){
      //use User.getReview() to get reviews
      User.getReview(function(data){
        if(data.length==0){
          res.render('mainpage',{
            lists:data,
            user:req.session.user
          });
          return;
        }
        for(var i=0,l=data.length;i<l;i++){
            data[i].url="/people/"+data[i].name;
            data[i].imgUrl=data[i].imgUrl.replace("./public","");
        }
        res.render('mainpage',{
            lists:data,
            user:req.session.user
        });
      });
  });
  //ajax asynchronous get request
  app.get('/getReview',function(req,res){
      User.getReviewPage(req.query.page,function(data){
          for(var i=0,l=data.length;i<l;i++){
              data[i].imgUrl=data[i].imgUrl.replace("./public","");
          }
          res.send(data)
      });
  });
  //user page
  app.get('/people/:user',function(req,res){
      User.get(req.params.user, function(err, user){
        user.imgUrl=user.imgUrl.replace("./public","");
         //get user info and his/her posts
          User.getReviewUser(user.name,function(reviews){
              res.render('people',{
                address: user.address,
                company: user.company,
                school : user.school,
                info : user.info,
                name:req.params.user,
                user:req.session.user,
                reviews:reviews,
                imgUrl:user.imgUrl
              });
          });
      });
  });
  //requesting editing personal information
  app.post('/people',function(req,res){
      //head image address
      var tmp_path,target_path;
      //if file upload
      if(req.files.thumbnail.size>0){
          tmp_path = req.files.thumbnail.path;
          // set file folder to save uploaded images
          //rename image
          var picType=req.files.thumbnail.name.split(".");
          picType=picType[1];
          target_path = './public/images/user/pic_' + req.session.user.name+"."+picType;
          // move file
          fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
           //here a image file will show up in the user folder
            imageMagick(target_path)
            //resize the image to be 150*150
            .resize(150, 150, '!')
            .autoOrient()
            .write(target_path, function(err){
              if (err) {
                console.log(err);
              }
            });
          });
      }
      var newUser = new User({
        name: req.session.user.name,
        address: req.body.address,
        company:req.body.company,
        school:req.body.school,
        info:req.body.info,
        imgUrl:target_path,
      });
      //update
      newUser.updataEdit(function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          //save user info into session
          req.session.user = newUser;
          //req.flash('success','Sign up Success');
          res.redirect('/people/'+newUser.name);
      });
  });
  //Review display page
  app.get('/reviews/:id',function(req,res){
	    User.findReview(req.params.id, function(err, items){
	         res.render('reviews',{
	             items:items[0],
	             user:req.session.user,
	             id:req.params.id,
	        });
	    });
	});
  //ajax asynchronous review posting address
	app.post('/review',function(req,res){
		var review={};
		review.title=req.body.title;
		review.reviewText=req.body.reviewText;
		review.comment=[];
		review.name=req.session.user.name;
		//call review function to save user review
		User.review(review,function(err, doc){
		     if(err){
		          req.flash('error',err);
		         return res.redirect('/');
		     }
		     //if save success, return the status of 1
		     res.send({"status": 1});
		})
	 });

  //ajax asynchronous commenting address
  app.post('/comment',function(req,res){
	    var comment={};
	    comment.comment=req.body.comment;
	    comment.user=req.session.user;
	    reviewId=req.body.reviewId;
	    User.comment(reviewId,comment,function(info){
	         res.redirect('/reviews/'+reviewId);
	    })
	});

  //backend asministration
  app.get('/admin',function(req,res){
    res.render('adminlogin', {
     user:req.session.user,
     error: req.flash('error').toString()
     });
  });
  //admin login post address
  app.post('/adminLogin',function(req,res){
    var adminName=req.body.name;
    var md5 = crypto.createHash('md5'),
        adminPwd = md5.update(req.body.password).digest('hex');
    User.superAdmin(adminName,adminPwd,function(info){
      if(info.admin=="1"){
        //if super admin, get corresponding administration info
        User.getReviewAdmin(function(data){
          res.render('admincon',{
            lists:data,
            user:req.session.user,
          });
        });
      }
      //if normal admin, get corresponsing administration info
      else if(info.admin=="2"){
        User.getReviewAdmin(function(data){
          res.render('admincon',{
            lists:data,
            user:req.session.user,
          });
        });
      }else{
        res.redirect('/mainpage');
      }
    });
  });
  //info administration page
  app.get('/admincon',function(req,res){
    res.redirect('/admin');
  });
  //change administration page
  app.post('/adminchange',function(req,res){
    var change=req.body.change,
      id=req.body.id,
      childId=req.body.childId,
      delAndRe=req.body.delAndRe

    User.adminChange(change,id,childId,delAndRe,function(data){
      if(data==1){
        User.getReviewAdmin(function(data){
          res.render('admincon',{
            lists:data,
            user:req.session.user,
          });
        });
      }
    });
  });
  //404 and error displaying page
  app.get('*',function(req,res){
    res.render('404', {
      title:"Sabor",
      name:"Your gourmet microblog.",
      user:req.session.user,
      error: req.flash('error').toString()
    });
  });
};
