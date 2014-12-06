var mongodb = require('./db');
function User(user){ 
  this.name = user.name; 
  this.password = user.password; 
  this.email = user.email; 
  this.address = user.address; 
  this.company=user.company; 
  this.school=user.school; 
  this.info=user.info; 
  this.imgUrl=user.imgUrl; 
}; 

module.exports = User; 

User.prototype.save=function(callback){ 
  var user = { 
      name: this.name, 
      password: this.password, 
      //set default values for required area, can be edited in the future
      address:"default",
      company:"default",
      school:"default",
      info:"default",
      imgUrl:"./public/images/default_image.jpg"
  }; 
  //open database
  mongodb.open(function(err,db){ 
    if(err){ 
      return callback(err); 
    } 
    //link user collection in the database, if not find create a new one
    db.collection('user',function(err,collection){ 
      //if connection failed, return an error and close database
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
       //insert new document
      collection.insert(user,{safe: true},function(err,result){ 
        mongodb.close(); 
        callback(err, user);
      }); 
    }); 
  }) 
}
//get user info
User.get = function(name, callback){ 
  //open databse
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //get user collection
    db.collection('user', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //get document whose 'user' value equals user
      collection.findOne({name: name},function(err, doc){ 
        mongodb.close(); 
        //success
        if(doc){ 
          var user = new User(doc); 
          callback(err, user);
        } 
        //fail
        else { 
          callback(err, null);
        } 
      }); 
    }); 
  }); 
};

User.review = function(review, callback){
  mongodb.open(function(err,db){ 
    if(err){ 
      return callback(err); 
    } 
    var date = new Date(); //add time attribute to reviews
    var time = { 
      date: date, 
      year : date.getFullYear(), 
      month : date.getFullYear() + "-" + (date.getMonth()+1), 
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(), 
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() 
    } 
    review.time=time; 
    //for future backend administration
    review.hide=true; 
  
    //save into the 'reviews' collection
    db.collection('reviews',function(err,collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //add id to each review
      //search in time series
      collection.find().sort({time:-1}).toArray(function(err,items){
        //if no entry, start from 0
        if(items.length==0){
          ids=0; 
        }
        //else find the nearest entry id and add 1
        else{ 
          ids=items[0]._id;
          ids++; 
        } 
        //define review id
        review._id=ids;
        collection.insert(review,{safe: true},function(err,result){ 
          mongodb.close(); 
          //success
          callback(err, review); 
        }); 
      }); 
    }); 
  }) 
}; 

User.getReview=function(callback){ 
  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    //get 'reviews' collection
    db.collection('reviews', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //find document whose 'user' value equals user
      collection.find({hide:{$ne:false}}).limit(5).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        //since there's no image in the 'reviews' collection, find again
        var open=0 
        db.collection('user', function(err, collection){ 
          if(items.length!=0){
            for(var i=0,l=items.length;i<l;i++){
              collection.findOne({name: items[i].name},function(err, doc){
                items[open].imgUrl=doc.imgUrl;
                open++;
                if(open==l){
                  mongodb.close();
                  return callback(items);
                }
              });
            }
          }else{
            mongodb.close();
            return callback(items);
          } 
        }); 
      }); 
    }); 
  }); 
};

User.getReviewPage=function(page,callback){
  
  var num=page*5;
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('reviews', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 
      //find document whose 'user' value equals user
      collection.find({hide:{$ne:false}}).skip(num).limit(5).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        //find again 
        var open=0 
        db.collection('user', function(err, collection){ 
          for(var i=0,l=items.length;i<l;i++){ 
            collection.findOne({name: items[i].name},function(err, doc){ 
              items[open].imgUrl=doc.imgUrl; 
              open++; 
              if(open==l){ 
                mongodb.close(); 
                return callback(items); 
              } 
            }); 
          } 
        }); 
      }); 
    });  
  }); 
};

User.findReview=function(id,callback){

  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('reviews', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.find({_id:Number(id)}).toArray(function(err,items){
        if(err) throw err;
        mongodb.close();
        return callback(err,items);
      });
    });
  });
};

User.comment=function(reviewId,comment,callback){

  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('reviews', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      collection.update({_id:Number(reviewId)},{$push:{comment:comment}},function(err,items){
        if(err) throw err;
        mongodb.close();
        return callback(items);
      });
    });
  });
};
User.getReviewUser=function(user,callback){ 

  mongodb.open(function(err, db){ 
    if(err){ 
      return callback(err); 
    } 
    db.collection('reviews', function(err, collection){ 
      if(err){ 
        mongodb.close(); 
        return callback(err); 
      } 

      collection.find({name:user}).sort({time:-1}).toArray(function(err,items){ 
        if(err) throw err; 
        mongodb.close(); 
        return callback(items); 
      }); 
    }); 
  }); 
}; 
User.prototype.updataEdit=function(callback){
  var user = {
      name: this.name,
      address:this.address,
      company:this.company,
      school:this.school,
      info:this.info,
      imgUrl:this.imgUrl
  };
  mongodb.open(function(err,db){
    if(err){
      return callback(err);
    }
    db.collection('user',function(err,collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      var upUser={};
      //check if needs any update
      if(user.address!=""){
        upUser.address=user.address;
      }
      if(user.company!=""){
        upUser.company=user.company;
      }
      if(user.school!=""){
        upUser.school=user.school;
      }
      if(user.info!=""){
        upUser.info=user.info;
      }
      if(!!user.imgUrl){
        upUser.imgUrl=user.imgUrl;
      }
      collection.update({'name':user.name},{$set:upUser},function(err,result){
        mongodb.close();
        callback(err, user);
      });
    });
  });
};

User.superAdmin=function(name,psd,callback){

  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    //get 'user' collection
    db.collection('user', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //check if is super admin
      if(name=="admin"){
        collection.find({ name : 'admin' }).toArray(function(err,items){
          if(err) throw err;
          mongodb.close();
          if(psd==items[0].password){
            return callback({admin:1});
          }else{
            return callback({admin:0});
          }
        });
      }else{
        collection.find({ name : name }).toArray(function(err,items){
          if(err) throw err;
          mongodb.close();
          if(psd==items[0].password){
            if(items.admin&&items.admin==2){
              return callback({admin:2});
            }
          }else{
            return callback({admin:0});
          }
        });
      }
    });
  });
};

User.superAdmin=function(name,psd,callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('user', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //check if is super admin
      if(name=="admin"){
        collection.find({ name : 'admin' }).toArray(function(err,items){
          if(err) throw err;
          mongodb.close();
          if(psd==items[0].password){
            return callback({admin:"1"});
          }else{
            return callback({admin:"3"});
          }
        });
      }else{
        mongodb.close();
        return callback({admin:"3"});
      }
    });
  });
};

User.getReviewAdmin=function(callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('reviews', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //return 10 entries
      collection.find().limit(10).sort({time:-1}).toArray(function(err,items){
        if(err) throw err;
        mongodb.close();
        return callback(items);
      });
    });
  });
};

User.adminChange=function(change,id,childId,delAndRe,callback){
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    db.collection('reviews', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //if user is shielded
      if(delAndRe=="del"){
        //if review has not been commented
        if(childId==""){
          collection.update({'_id':Number(id)},{$set:{hide:false}},function(err,info){
            if(err) throw err;
            mongodb.close();
            callback(info);
          });
        }else{
        //if the review has been commented
          collection.update({"comment.comment":childId},{$set:{hide:false}},function(err,info){
            if(err) throw err;
            mongodb.close();
            callback(info);
          });
        }
      }else{
        if(childId==""){
          collection.update({'_id':Number(id)},{$set:{hide:true}},function(err,info){
            if(err) throw err;
            mongodb.close();
            callback(info);
          });
        }else{
          collection.update({"comment.comment":childId},{$set:{hide:true}},function(err,info){
            if(err) throw err;
            mongodb.close();
            callback(info);
          });
        }
      } 
    });
  });
}