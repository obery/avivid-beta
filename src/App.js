import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CancelIcon from '@material-ui/icons/Cancel';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import MicRoundedIcon from '@material-ui/icons/MicRounded';
import MicOffRoundedIcon from '@material-ui/icons/MicOffRounded';
import VideocamOffRoundedIcon from '@material-ui/icons/VideocamOffRounded';
import PhoneIcon from '@material-ui/icons/Phone';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import './App.css';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import logo from './assets/ps.jpg'
import logo2 from './assets/ph.jpg'


const socket = io('https://avivid.herokuapp.com', {
	withCredentials: true,
});

function App() {
	const [me, setMe] = useState('');
	const [showConfig, setConfig] = useState(false);

	const [stream, setStream] = useState();
	const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState('');
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);
	const [idToCall, setIdToCall] = useState('');
	const [callEnded, setCallEnded] = useState(false);
	const [name, setName] = useState('');
	const [vidcancel, setvidcancel] = useState(false);
	const [audicanel, setaudicanel] = useState(false);

	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();


	const constrain = {
		video: false, 
		audio: true
	}

	useEffect(() => {
		socket.on('me', (id) => {
			setMe(id);
		});

		socket.on('callUser', (data) => {
			setReceivingCall(true);
			setCaller(data.from);
			setName(data.name);
			setCallerSignal(data.signal);
		});
	}, []);



	const useVideo = ()=>{
        setvidcancel(false)
		setaudicanel(true)
		navigator.mediaDevices.getUserMedia({video: true, audio:true}).then((stream) => {
			setStream(stream);
			myVideo.current.srcObject = stream;
		});

	}

	const useAudio = ()=>{
        setvidcancel(true)
		setaudicanel(false)

		navigator.mediaDevices.getUserMedia({video: false, audio:true}).then((stream) => {
			setStream(stream);
			myVideo.current.srcObject = stream;
		});
	}

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			console.log(data)
			socket.emit('callUser', {
				userToCall: id,
				signalData: data,
				from: me,
				name: name,
			});
		});
		peer.on('stream', (stream) => {
			userVideo.current.srcObject = stream;
		});
		socket.on('callAccepted', (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});

		connectionRef.current = peer;
	};

	const answerCall = () => {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.emit('answerCall', { signal: data, to: caller });
		});
		peer.on('stream', (stream) => {
			userVideo.current.srcObject = stream;
		});

		peer.signal(callerSignal);
		connectionRef.current = peer;
	};

	const leaveCall = () => {
		setCallEnded(true);
		connectionRef.current.destroy();
	};

	return (
		<>
			<h1 style={{ textAlign: 'center', color: '#fff' }}>Zoomish</h1>
			<div className="container">
       <center>

				<div id="firstbox" className="myId">
				
				 <div className="icongrid">
				<Button onClick={useVideo}>
				{vidcancel?
                 <VideocamOffRoundedIcon style={{fontSize:40}}  fontSize={'large'} color="primary"/>
				:
				 <VideoCallIcon  style={{fontSize:40}}  fontSize={'large'} color="primary"/>
			    }
				</Button>

				<Button onClick={useAudio}>
					{audicanel?
                     <MicOffRoundedIcon style={{fontSize:40}}  fontSize={'large'} color="secondary"/>
					:
                    <MicRoundedIcon style={{fontSize:40}}  fontSize={'large'} color="secondary"/>}
				</Button>
				 </div>
				       {vidcancel?(
							<center style={{width:200,marginTop:10}}>
                        <AvatarGroup  max={2}>
							<Avatar style={{height:100,width:100}} alt="Remy Sharp" src={logo2} />
							<Avatar style={{height:100,width:100}}  alt="Travis Howard" src={logo} />
						</AvatarGroup>
						{stream && (
								<audio
									playsInline
									muted
									ref={myVideo}
									autoPlay
									style={{ width: '100%', height: '100%' }}
								/>
							)}
							{callAccepted && !callEnded ? (
							<audio playsInline ref={userVideo} autoPlay style={{ width: '100%', height: '100%' }} />
						) : null}
							</center>
						
						):(
							<div className="video">
					
						<div className={callAccepted && !callEnded ? 'video2' : 'video'}>
							{stream && (
								<video
									playsInline
									muted
									ref={myVideo}
									autoPlay
									style={{ width: '100%', height: '100%' }}
								/>
							)}
							
						</div>
						{callAccepted && !callEnded ? (
							<video playsInline ref={userVideo} autoPlay style={{ width: '100%', height: '100%' }} />
						) : null}
					</div>
						)}
					
				</div>
        </center>


       

				{/* second pane  */}

        {showConfig?(
          <div id="config" className="myId">
            <CancelIcon onClick={()=>setConfig(false)} color="secondary" fontSize="large" />
					<TextField
						id="filled-basic"
						label="Enter Chat Name"
						variant="outlined"
						value={name}
						onChange={(e) => setName(e.target.value)}
						style={{ backgroundColor: 'white',height:55,borderRadius:5,width:'100%',marginTop:10}}
						className="inp"
					/>

					<CopyToClipboard text={me} style={{height:40,width:'100%',marginTop:10}}>
						<Button style={{background:'#0066b8'}} variant="contained" color="secondary" startIcon={<AssignmentIcon fontSize="large" />}>
							Create Channel
						</Button>
					</CopyToClipboard>

					<TextField
						id="filled-basic"
						label="Channel ID to call"
						variant="outlined"
						value={idToCall}
						onChange={(e) => setIdToCall(e.target.value)}
            style={{ backgroundColor: 'white',height:55,borderRadius:5,width:'100%',marginTop:10}}
					/>
					<div className="call-button">
						{callAccepted && !callEnded ? (
							<Button variant="contained" color="secondary" onClick={leaveCall}>
								End Call
							</Button>
						) : (
							<IconButton color="secondary" aria-label="call" onClick={() => callUser(idToCall)}>
								<PhoneIcon style={{fontSize:70}} fontSize="large" />
							</IconButton>
						)}
						{idToCall}
					</div>
          <div>
						{receivingCall && !callAccepted ? (
							<div className="caller">
								<h1>{name} is calling...</h1>
								<Button variant="contained" color="primary" onClick={answerCall}>
									Answer
								</Button>
							</div>
						) : null}
					</div>  
				</div>
        ):(
          <div id="except" className="myId">
          <Button onClick={()=>setConfig(true)} id="openconfig" style={{background:'#0066b8',width:'100%',margin:0,display:'flex',height:50,fontWeight:'bold'}} variant="contained" color="secondary" startIcon={<MenuBookIcon fontSize="larger" />}>
            Menu Book
          </Button>
          </div>
        )}
				
			</div>
		</>
	);
}

export default App;
