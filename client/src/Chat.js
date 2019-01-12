import React from "react";
import io from "socket.io-client";
import emoji from "./emoji"
import themes from "./themes"
class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            message: '',
            messages: [],
            writing: '',
            users: [],
            channel: [],
            join: '',
            numUsers: 0,
            theme: '',
        };
        this.socket = io('http://localhost:4001/')
        this.state.join = localStorage.getItem('join');

        ///////////////////////////////////////////////////
        // I) EVENEMENT SOCKET.IO
        //////////////////////////////////////////////////
        //CONNEXION
        this.socket.on('connection', function() {
            this.setState({
                messages: [...this.state.messages, 'data']
            });
        });
        //RECEPTION MSG
        this.socket.on('RECEIVE_MESSAGE', function(data) {
            addMessage(data);
            document.getElementsByClassName('messages')[0].scrollTo(0, 99999);
        });

        //NOMBRE UTILISATEUR CONNECTES
        this.socket.on('INFOS_CHANNEL', function(nb_co) {
            addInfos(nb_co)
        });

        //LISTE CHANNEL
        this.socket.on('LIST_CHANNEL', function(channel) {
            listChannel(channel)
        })

        //CHANGE CHANNEL
        this.socket.on('CHANGE_CHANNEL', function(channel) {
            localStorage.setItem('join', channel);
            changeChannel(channel)
        })

        //AJOUT DE CHANNEL
        this.socket.on('ADD_CHANNEL', function(channel) {
            addChannel(channel)
        });

        //LISTE USERS
        this.socket.on('LIST_USERS', function(users) {
            listUsers(users)
        });

        //AJOUT USERS
        this.socket.on('ADD_USERS', function(users) {
            addUsers(users)
        });



        //PENDANT ECRITE
        this.socket.on('SEE_WRITING', function(callback) {
            if (callback == true) {
                document.getElementById('writing').style.display = "block";
                seeWriting("Quelqu'un écrit la!!")
            } else if (callback == false) {
                document.getElementById('writing').style.display = "none";
                seeWriting("")
            }
        });

        ///////////////////////////////////////////////////
        //[FIN] EVENEMENT SOCKET.IO
        //////////////////////////////////////////////////

        ///////////////////////////////////////////////////
        // II) FONCTIONS CRUD
        //////////////////////////////////////////////////

        /*AJOUT MSG*/
        const addMessage = data => {
            this.setState({
                messages: [...this.state.messages, data]
            });
        }

        /*AFFICHE NOMBRE UTILISATEUR CONNECTES AU CHANNEL*/
        const addInfos = data => {
            this.setState({
                numUsers: data
            });
        };

        /*LISTE CHANNEL*/
        const listChannel = data => {
            this.setState({
                channel: data
            });
        };
        /*AJOUT CHANNEL*/
        const addChannel = data => {
            //this.setState({channel: data});
            this.setState({
                channel: [...this.state.channel, data]
            });
        };

        /*CHANGER CHANNEL*/
        const changeChannel = channel => {
            this.setState({
                join: channel
            });
        }

        /*LISTE USERS*/
        const listUsers = data => {
            this.setState({
                users: data
            });
        };

        /*AJOUT USER*/
        const addUsers = data => {
            this.setState({
                users: [...this.state.users, data]
            });
        };

        /*Voir quelqu'un écrire*/
        const seeWriting = data => {
            this.setState({
                writing: data
            });
        };

        ///////////////////////////////////////////////////
        //[FIN] FONCTIONS CRUD
        //////////////////////////////////////////////////

        ///////////////////////////////////////////////////
        // III) EVENEMENT AU CLICK
        //////////////////////////////////////////////////
        // a) CHANGER DE CHANNEL (au click)
        this.changeRoom = ev => {
            var room = ev.target.textContent;
            room = room.substr(0, room.length);
            this.setState({
                messages: []
            });
            this.setState({
                join: room
            });
            localStorage.setItem('join', room);
            this.socket.emit('JOIN_CHANNEL', room)
        }

        // b) CONTACTER UN UTILISATEUR (au click)
        this.contactUser = ev => {
            var user = ev.target.textContent;
            user = user.substr(3, user.length);
            this.setState({
                message: [...this.state.message, '']
            });
            this.setState({
                message: [...this.state.message, '/msg ' + user + ' ']
            });
        }

        // c) CHANGER DE THEME (au click)
        this.changeTheme = ev => {
            var key = Object.keys(themes);
            var random_key = Math.floor(Math.random() * (key.length - 1 - 0 + 1)) + 0;
            var choice = Object.getOwnPropertyNames(themes)[random_key];
            if (this.state.theme === choice) {
                this.changeTheme();
                return;
            }
            this.setState({
                theme: choice
            });
            var b_color = themes[choice].b_color;
            var main_color = themes[choice].main_color;
            var second_color = themes[choice].second_color;
            var text = themes[choice].text;
            var btn = themes[choice].btn;
            // 1) ANIMATION
            /////////////////////////////
            document.body.style.transition = "all 0.6s";  
            document.getElementsByClassName("topnav")[0].style.transition = "all 2s";    
            document.getElementsByClassName('active')[0].style.transition = "all 2s"; 
            document.getElementsByClassName('sidenav')[0].style.transition = "all 2s"; 
            document.getElementsByClassName('main-title')[0].style.transition = "all 1.7s"; 
            document.getElementsByClassName('sidenav')[0].style.transition = "all 1.8s"; 
            document.getElementsByClassName('btn-dark')[0].style.transition = "all 1.6s"; 

            // 2) CHANGEMENT DE COULEURS
            /////////////////////////////
            document.body.style.backgroundColor = b_color;
            document.getElementsByClassName('topnav')[0].style.backgroundColor = main_color;
            document.getElementsByClassName('active')[0].style.backgroundColor = second_color;
            document.getElementsByClassName('sidenav')[0].style.backgroundColor = main_color;
            document.getElementsByClassName('main-title')[0].style.color = text;
            document.getElementsByClassName('sidenav')[0].style.color = text;
            document.getElementsByClassName('btn-dark')[0].style.backgroundColor = btn;
        }
        ///////////////////////////////////////////////////
        //{FIN] EVENEMENT AU CLICK
        //////////////////////////////////////////////////

        ///////////////////////////////////////////////////
        // IV) COMMANDES && ENVOI DE MESSAGE
        //////////////////////////////////////////////////
        var i = 0;
        this.sendMessage = ev => {
            ev.preventDefault();


        ///////////////////////////////////////////////////
        // a) COMMANDES
        ////////////////////////////////////////////////// 

            // 1) CONNEXION
            //////////////////////////////
            if (this.state.message.includes('/nick')) {
                var user = this.state.message.split(' ');
                var info = {
                    socket_id: this.socket.id,
                    username: user[1]
                };
                var user_profile = []
                user_profile.push(info)
                localStorage.setItem('user', JSON.stringify(info));
                this.setState({
                    message: ''
                });
                this.socket.emit('CHECK_CONN', {
                    user_co: user[1]
                })
                this.socket.emit('ADD_USERS', {
                    id: this.socket.id,
                    username: user[1]
                })
            }

            // 2) ENVOYER UN MSG PRIVE
            //////////////////////////////
            else if (this.state.message.includes('/msg')) {
                var data = this.state.message.split(' ');
                var msg = '';
                /*Reconstruction string à partir du 2eme argument*/
                for (var i = 2; i < data.length; i++) {
                    msg += data[i] + ' ';
                }
                this.socket.emit('PRIVATE_MESSAGE', data[1], msg)
            }

            // 3) CREER UN CHANNEL
            //////////////////////////////
            else if (this.state.message.includes('/create')) {
                var data = this.state.message.split(' ');
                this.socket.emit('CREATE_CHANNEL', data[1])
            }

            // 4) SUPPRIMER UN CHANNEL
            //////////////////////////////
            else if (this.state.message.includes('/delete')) {
                var data = this.state.message.split(' ');
                this.socket.emit('DELETE_CHANNEL', data[1])
            }

            // 5) REJOINDRE UN CHANNEL
            //////////////////////////////
            else if (this.state.message.includes('/join')) {
                var data = this.state.message.split(' ');
                //this.socket.emit('JOIN_CHANNEL', data[1])
                this.socket.emit('JOIN_CHANNEL', data[1])
            }

            // 6) QUITTER UN CHANNEL
            //////////////////////////////
            else if (this.state.message.includes('/part')) {
                localStorage.removeItem('join');
                this.setState({
                    join: ''
                });
                this.socket.emit('LEAVE_CHANNEL')
            }

            // 7) LISTER DES UTILISATEURS
            //////////////////////////////
            else if (this.state.message.includes('/users')) {
                var channel = localStorage.getItem('join')
                this.socket.emit('GET_USERS', channel)
            }

            // 8) LISTER CHANNELS
            //////////////////////////////
            else if (this.state.message.includes('/list')) {
                this.socket.emit('GET_CHANNEL')
            }

            // 9) CLEAR LE CHAT
            //////////////////////////////
            else if (this.state.message.includes('/clear')) {
                this.setState({
                    messages: []
                });
            } else {
        ///////////////////////////////////////////////////
        // b) ENVOI DE MESSAGES
        ////////////////////////////////////////////////// 
                if (localStorage.hasOwnProperty('user')) {
                    /*On vérifie la présence d'émoji*/
                    for (var input in emoji) {
                        this.state.message = this.state.message.replace(input, emoji[input])
                    }
                    /*On récupere la date actuel*/
                    var now = new Date();
                    var hour = now.getHours();
                    var minute = now.getMinutes();
                    if (hour.toString().length == 1) {
                        hour = '0' + hour;
                    }
                    if (minute.toString().length == 1) {
                        minute = '0' + minute;
                    }
                    var date = hour + 'h' + minute;
                    var socket_id = JSON.parse(localStorage.getItem('user'))['socket_id']
                    var username = JSON.parse(localStorage.getItem('user'))['username']


                    // 1) ENVOI A UN CHANNEL SPECIFIQUE
                    //////////////////////////////////////////
                    if (localStorage.hasOwnProperty('join')) {
                        var channel = localStorage.getItem('join')
                        this.socket.emit('SEND_CHANNEL_MESSAGE', {
                            socket_id: socket_id,
                            channel: channel,
                            image: 'fa fa-user-o',
                            author: username,
                            message: this.state.message,
                            date: date,
                        }, channel)
                    } else {
                    // 2) ENVOI TOUS UTILISATEURS 
                    //////////////////////////////////////////
                        this.socket.emit('SEND_MESSAGE', {
                            socket_id: socket_id,
                            channel: "GENERAL",
                            image: 'fa fa-user-o',
                            author: username,
                            message: this.state.message,
                            date: date,
                        })
                    }
                }
            }
            this.setState({
                message: ''
            });
        }

        ///////////////////////////////////////////////////
        //[FIN] COMMANDES && ENVOI DE MESSAGE
        //////////////////////////////////////////////////

    }
    /*RESET*/
    componentWillMount() {
        localStorage.removeItem('join');
        localStorage.removeItem('users');
    }
    componentDidMount() {
        this.changeTheme();
    }
    componentDidUpdate() {
        /*ICONE QUI APPARAIT PENDANT L'ECRITURE*/
        if (document.getElementById('m').value.length > 2) {
            document.getElementById('writing').style.display = "block";
        } else {
            document.getElementById('writing').style.display = "none";
        }
    }
render(){
    return (
        <div>
            <div class="topnav">
                <p class="active">
                <h3>#{this.state.join}</h3></p>
                <a><i class="fa fa-users"></i> {this.state.numUsers}</a>
                <a class="theme-btn" onClick={this.changeTheme}><i class="fa fa-pencil"></i> <span class="theme-text">Changer de thème</span></a>
                <p class="icon-right"><i class="fa fa-ellipsis-v"></i></p>
            </div>
            <div class="sidenav">
                <strong class="big-title"><a class="main-title">My IRC</a></strong>
                <img class="icon-title" src="https://cdn1.iconfinder.com/data/icons/communication-social-media-set-3/512/15-512.png" />
                <a class="channel-title"><strong><i class="fa fa-hashtag"></i>Chaînes</strong></a>
                {this.state.channel.map(chat => {
                    return (
                        <a class="btn btn-outline-danger"  href="#" onClick={this.changeRoom}><i class="fa fa-hashtag"></i>{chat.name}</a>
                        )
                })}
                <a class="channel-users"><i class="fa fa-user-circle"></i><strong> Utilisateurs</strong></a>
                {this.state.users.map(user => {
                    return (
                        <a class="user-item"  href="#" onClick={this.contactUser}>🔵 {user.username}</a>
                        )
                })}
            < /div>
            <div class="block-chat">
                <div className="main">
                    <form action="">
                        <ul className="messages">
                        {this.state.messages.map(message => {
                            return (
                                <li>
                                    <div class="block-msg-channel"> 
                                        <strong><i class="fa fa-hashtag"></i>{message.channel}</strong>
                                    </div>
                                    <div class="block-msg-user"> 
                                        <i className={message.image}></i> <strong>{message.author} </strong>
                                    <div class="block-msg-time">{message.date} <i class="fa fa-clock-o"></i></div> 
                                </div>
                                    <div class="block-msg">
                                        {message.message}
                                    </div>
                                </li>
                                )
                        })}
                        <p id="writing"><img src={require('./writing.gif')} /></p>
                        </ul>
                        <div class="block-input">
                            <input list="cmd" class="form-control"  id="m" autocomplete="off" placeholder="Votre message..." value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
                                    <datalist id="cmd">
                                    <option value="/nick " />
                                    <option value="/create " />
                                    <option value="/join " />
                                    <option value="/part" />
                                    <option value="/delete " />
                                    <option value="/msg" />
                                    <option value="/list" />
                                    <option value="/users" />
                                    <option value="/clear" />
                                </datalist>
                            <button onClick={this.sendMessage} className="btn btn-dark form-control"><i class="fa fa-paper-plane"></i></button>
                        </div>
                    </form>
                < /div>
            </div>
        </div>
        );
}
}
export default Chat;