import React ,{useState,useEffect} from 'react';
import { useSocket } from '../context/socketContext';
import {useNavigate} from 'react-router-dom'

const Home=()=>{
    
    const {socket} = useSocket();
    const [email, setEmail]=useState('');
    const [name,setName]=useState('');
    const [roomId,setRoomId]=useState('');
    const  JoinRoom=()=>{
      if(!name || !email || !roomId)return;
      socket.emit("join-room",{name,email,roomId});
    }
    const navigate=useNavigate();
    const HandleJoin=(props)=>{
     if(props.roomId){
      navigate(`/rooms/${props.roomId}`);
     
     }
     
    }
    const HandleRoomFull=()=>{
      window.alert(`Room is full you are not allowed to join this room please wait or join another room`);
      navigate('/');
    }
    useEffect(()=>{
      socket.on("room-full",HandleRoomFull)
      socket.on("user-joined",HandleJoin)
      return ()=>{
        socket.off("user-joined",HandleJoin);
        socket.off("room-full",HandleRoomFull);
      }
    },[socket])
    return (
        <div>
            <input type='text' value={name} onChange={(e)=>{ setName(e.target.value)}} placeholder='Enter your full name ....'></input>
            <input type='email' value={email} onChange={(e)=>{setEmail(e.target.value)}} placeholder='Enter email ....'></input>
            <input type='text' value={roomId} onChange={(e)=>{setRoomId(e.target.value)}} placeholder='Enter your room Id ....'></input>
            <button type='submit' onClick={JoinRoom} >Join Room</button>
        </div>
    )
}

export default Home;