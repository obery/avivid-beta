import React ,{Component} from "react"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer" 
import io from "socket.io-client"
import "./App.css"







const socket =  io('https://avivid.herokuapp.com',{
  withCredentials: true,
})






export default class Apps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      me:'',
      stream:'',
      receivingCall:''
    };
  }

  render() {
    return (
      <div>
        <span> Apps </span>
      </div>
    );
  }
}
