import React from 'react';
import io from "socket.io-client";
 
class Navbar extends React.Component {
    constructor(props){
        super(props);
        this.socket = io('http://localhost:4001/')
		this.state = {
			channel: []
        };
        this.changeRoom = ev => {
        var room = ev.target.textContent;
        }

        this.socket.on('LIST_CHANNEL', function(channel){
            addChat(channel)
        });
        /*AJOUT CHAINES*/
        const addChat = data => {
            this.setState({channel: [...this.state.channel, data]});
        };
    }
}
 
export default Navbar;