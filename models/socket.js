module.exports = function(io){
	//store list of online users
	var users = [];
	io.sockets.on('connection',function(socket){
	 socket.on('online',function(data){
	   //store online users as attributes of socket
	   socket.name = data.user;
	   //add user if not already exist
	   if(users.indexOf(data.user) == -1){
	     users.unshift(data.user);
	   }
	   //broadcast that this user is now online
	   io.sockets.emit('online',{users:users,user:data.user});
	});
	//get offline notice
	socket.on('disconnect',function(){
	 //if username is stored in the 'user' list
	 if(users.indexOf(socket.name) != -1){
	   //remove this user from list
	   users.splice(users.indexOf(socket.name),1);
	   //and broadcast that this user is now offline
	   socket.broadcast.emit('offline',{users:users,user:socket.name});
	 }
	});

	//private messages
	socket.on('selfTalk',function(data,fn){
		fn("ok");
		var clients = io.sockets.clients();
		clients.forEach(function(client){
		     if(client.name == data.to){
		       //trigger this user's client's talk event
		       client.emit('selfTalk',data);
		     }
		   });
		});
	});
};
