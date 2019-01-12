const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var chaine = [{
	author_id: 'My_IRC',
	name: 'general',
	users: []
}];
var users = [];
var nspace = '/';
var j = 0;
var admin_icon = "fa fa-user-secret";
var private_icon = "fa fa-expeditedssl";


io.on("connection", socket => {
	var socket_username = null;
	var join_channel = null;
	var i = 0;
	var date = getDate();
	
	var conn_false = {
		channel: "PRIVATE",
		date: date,
		image: admin_icon,
		author: "My_IRC",
		message: "Vous n'êtes pas connecté. Tapez /nick suivant de votre pseudo."
	};

	var join_false = {
		channel: "PRIVATE",
		date: date,
		image: admin_icon,
		author: "My_IRC",
		message: "Vous êtes déjà dans ce channel. Tapez /join pour rejoindre un nouveau channel."
	};

	if (chaine.length > 0) {
		io.emit('LIST_CHANNEL', chaine);
	}
	if (users.length > 0) {
		io.emit('LIST_USERS', users);
	}


	io.to(socket.id).emit('RECEIVE_MESSAGE', {
		channel: "PRIVATE",
		image: admin_icon,
		author: "My_IRC",
		message: "Bienvenue sur MY IRC, tapez /nick suivant de votre pseudo pour vous connectez.",
		date: date
	});
	/*CHECK CONNEXION*/
	socket.on('CHECK_CONN', function(data) {
		i++;
		/*1er connexion*/
		if (i <= 1) {
			socket.join('general');
			socket_username = data['user_co'];
			io.to('general').emit('RECEIVE_MESSAGE', {
				channel: 'GENERAL',
				image: admin_icon,
				author: "My_IRC",
				message: "" + data['user_co'] + " vient de se connecté ",
				date: date
			});
			console.log(data['user_co'] + " vient de se connecté | socket id : " + socket.id)
			var user = {
				id: socket.id,
				username: data['user_co'],
			}
			users.push(user);
			io.emit('ADD_USERS', user);
		} else {
			var current_room = Object.keys(socket.rooms)[1];
			var index = users.findIndex(o => o.id === socket.id);
			if (index > -1) {
				users.splice(index, 1);
			}
			var user = {
				id: socket.id,
				username: data['user_co'],
			}
			users.push(user);

			io.to(current_room).emit('RECEIVE_MESSAGE', {
				channel: 'GENERAL',
				date: date,
				image: admin_icon,
				author: "My_IRC",
				message: "" + socket_username + " a changé son pseudo en " + data['user_co']
			});
			io.emit('LIST_USERS', users);
		}

		console.log("Nombre d'utilisateur connecté : " + socket.conn.server.clientsCount);
		console.log(users);
	})

	/*DECONNEXION*/
	socket.on('disconnect', () => {
		i = 0;
		if (socket_username) {
			var index = users.findIndex(o => o.id === socket.id);
			if (index > -1) {
				users.splice(index, 1);
			}
			io.emit('RECEIVE_MESSAGE', {
				channel: "GENERAL",
				date: date,
				image: admin_icon,
				author: "My_IRC",
				message: socket_username + " s'est déconnecté."
			});
			console.log(socket_username + " s'est déconnecté.");
		}
	})


	socket.on('WRITING', function(callback) {
		io.emit('SEE_WRITING', callback);
	})

	/*ENVOI MSG ALL USERS*/
	socket.on('SEND_MESSAGE', function(data) {
		/*Check connexion*/
		if (socket_username) {
			//io.emit('RECEIVE_MESSAGE', data);
			io.to('general').emit('RECEIVE_MESSAGE', data)
		} else {
			io.to(socket.id).emit('RECEIVE_MESSAGE', conn_false);
		}
	})

	socket.on('SEND_CHANNEL_MESSAGE', function(data, room) {
		io.to(room).emit('RECEIVE_MESSAGE', data);
	})

	/*CREER UN CHHANEL*/
	socket.on('CREATE_CHANNEL', function(channel) {

		var item = chaine.find(o => o.name === channel);
		if (item == undefined) {
			io.emit('RECEIVE_MESSAGE', {
				channel: "GENERAL",
				date: date,
				image: admin_icon,
				author: "My_IRC",
				message: "Un nouveau channel vient d'être créer : " + channel + ". Tapez /join " + channel + " pour rejoindre la discussion."
			});
			/*socket.join(channel)*/
			var chat = {
				author_id: socket.id,
				name: channel,
				users: []
			}
			io.emit('ADD_CHANNEL', chat);
			console.log("Nouveau channel vient d'être créer : " + channel);
			chaine.push(chat);
			j++
		} else {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: date,
				image: admin_icon,
				author: "My_IRC",
				message: "Ce channel existe déjà. Tapez /join " + channel + " pour rejoindre la discussion."
			});
		}

	})

	/*REJOIN UN CHANNEL*/
	socket.on('JOIN_CHANNEL', function(room) {
		if (socket_username) {
			var currentRoom = socket.rooms[Object.keys(socket.rooms)[1]];
			var item = chaine.find(o => o.name === room);
			if (item == undefined) {
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: date,
					image: admin_icon,
					author: "My_IRC",
					message: "Ce channel n'existe pas"
				});
			} 
			else if (currentRoom == room)
			{
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: date,
					image: admin_icon,
					author: "My_IRC",
					message: "Vous êtes déjà dans ce channel. Tapez /create pour créer un nouveau channel."
				});
			}
			else 
			{

				for (var info in item.users) {
					var index_users = item.users.findIndex(o => o.id === socket.id);
					console.log(index_users);
					if (index_users > -1) {
						item.users.splice(index_users, 1);
					}
				}
				socket.leave(currentRoom);
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: date,
					image: admin_icon,
					author: "My_IRC",
					message: "Vous avez quitté le channel : #"+currentRoom,
				});
				console.log('[' + socket.id + ']', 'a quitté le channel :', currentRoom)
				io.to(currentRoom).emit('RECEIVE_MESSAGE', {
					channel: currentRoom,
					date: date,
					image: admin_icon,
					author: "My_IRC",
					message: socket_username + " a quitté le channel"
				});
				socket.join(room);
				io.to(socket.id).emit('CHANGE_CHANNEL', room);
				var user = {
					id: socket.id
				};
				item.users.push(user);


				io.to(room).emit('INFOS_CHANNEL', item.users.length);
						console.log('[' + socket.id + ']', 'a rejoint le channel :', room) //
						io.to(room).emit('RECEIVE_MESSAGE', {
							channel: room,
							date: date,
							image: admin_icon,
							author: 'My_IRC',
							message: socket_username + " vient de rejoindre le channel"
						});
					}
				} 
				else 
				{

					io.to(socket.id).emit('RECEIVE_MESSAGE', conn_false);
				}
			})

	/*QUITTER UN CHANNEL*/
	socket.on('LEAVE_CHANNEL', function() {
		var current_room = Object.keys(socket.rooms)[1];
		var item = chaine.find(o => o.name === current_room);
		if (item !== undefined) {
			for (var info in item.users) {
				var index_users = item.users.findIndex(o => o.id === socket.id);
				console.log(index_users);
				if (index_users > -1) {
					item.users.splice(index_users, 1);
				}
			}

			io.to(current_room).emit('INFOS_CHANNEL', item.users.length);
			socket.leave(current_room);
			io.to(socket.id).emit('INFOS_CHANNEL', users.length);
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: date,
				image: admin_icon,
				author: "My_IRC",
				message: "Vous avez quitté le channel : #" + current_room + "."
			});
			io.to(current_room).emit('RECEIVE_MESSAGE', {
				channel: current_room,
				date: date,
				image: admin_icon,
				author: "My_IRC",
				message: socket_username + " a quitté le channel"
			});
		} else {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: date,
				image: admin_icon,
				author: 'My_IRC',
				message: "Vous êtes dans le channel #GENERAL. Pour changer de channel utiliser la commande /join."
			});
		}
	})

	socket.on('DELETE_CHANNEL', function(channel) {
		/*Recupere l'id du channel*/
		var index = chaine.findIndex(o => o.name === channel);
		var item = chaine.find(o => o.name === channel);
		if (item.author_id === socket.id) {
			if (index > -1) {
				chaine.splice(index, 1);
			}
			/*Reset tout*/
			io.emit('LIST_CHANNEL', chaine);
		} else {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: date,
				image: admin_icon,
				author: 'My_IRC',
				message: "Vous ne pouvez pas supprimer ce channel."
			});
		}
	})

	/*MESSAGE PRIVE*/
	socket.on('PRIVATE_MESSAGE', function(name, msg) {
		var sender = users.find(o => o.id === socket.id);
		var receiver = users.find(o => o.username === name);
		console.log(receiver)
		if (receiver !== undefined) {
			console.log(socket.id + ' envoie un message à ' + receiver.id + ' : ' + msg);
			io.to(receiver.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE @" + sender.username,
				image: private_icon,
				author: sender.username,
				message: msg
			});
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE @" + receiver.username,
				image: private_icon,
				author: sender.username,
				message: msg
			});
		} else {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: date,
				image: admin_icon,
				author: 'My_IRC',
				message: "Cette utilisateur n'est pas connecté"
			});
		}
	})

	/*GET ALL USERS*/
	socket.on('GET_USERS', function(channel) {
		var list = "";
		/*Get les infos du channel courant*/
		var item = chaine.find(o => o.name === channel);
		var nb_co = 0;
		console.log(item);
		if (item !== undefined) {
			for (var info in item.users) {
				/*Get les infos de chaque user*/
				nb_co = item.users.length;
				var username = users.find(o => o.id === item.users[info].id);
				if (username !== undefined) {
					list += "* " + username.username + " ";
				}
			}
		} else {
			list = "Aucun";
		}
		console.log(nb_co);
		io.emit('INFOS_CHANNEL', nb_co);
		io.to(socket.id).emit('RECEIVE_MESSAGE', {
			date: date,
			channel: 'PRIVATE',
			image: admin_icon,
			author: "My_IRC",
			message: "Utilisateur(s) connecté(s) sur #" + channel + " (" + nb_co + "): " + list
		});


	})


	/*GET ALL CHANNEL*/
	socket.on('GET_CHANNEL', function() {
		var list = "";

		for (var info in chaine) {
			list += "* " + chaine[info].name + " ";
		}

		if (chaine.length == 0) {
			list = "Aucun";
		}
		io.to(socket.id).emit('RECEIVE_MESSAGE', {
			channel: "PRIVATE",
			date: date,
			image: admin_icon,
			author: "My_IRC",
			message: "Channels actifs (" + chaine.length + "): " + list
		});

	})
});

function getDate(){


	var now = new Date();
	var hour = now.getHours();
	var minute = now.getMinutes();
	if (hour.toString().length == 1) {
		hour = '0' + hour;
	}
	if (minute.toString().length == 1) {
		minute = '0' + minute;
	}
	return date = hour + 'h' + minute;
}



server.listen(port, () => console.log(`Serveur connecté au port : ${port}`));