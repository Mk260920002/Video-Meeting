import React, { createContext, useState, useEffect,useRef } from "react";
import { useSocket } from "./socketContext";

const WebRTCContext = createContext(null);

const configuration = {
  iceServers: [
    { urls:[ "stun:stun.l.google.com:19302","stun:global.stun.twilio.com:3478",], },
    {
      urls: "turn:your-turn-server.com",
      username: "username",
      credential: "password",
    },
    
  ],
};


export const usePeer = () => React.useContext(WebRTCContext);

export const PeerProvider = (props) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const { socket } = useSocket();
  const localStreamRef = useRef(null);
  // Setup local stream
  const setupLocalStream = async () => {
    try {
      console.log("Requesting access to media devices...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      await setLocalStream(stream); // Updates React state
      localStreamRef.current = stream; // Updates ref immediately
      console.log("Local stream initialized:", stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // Initialize PeerConnection
  const initializePeerConnection =async () => {
    //console.log('initializePeerConnection success');
    const pc =await new RTCPeerConnection(configuration);
   // console.log('initializePeerConnection succes',pc);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE Candidate generated:", event.candidate);
        socket.emit("iceCandidate", event.candidate);
      }
    };
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };
   await setPeerConnection(pc);
    return pc;
  };
  
  // Create offerx
  const createOffer = async (pc) => {
    // if(pc){
    //   console.log('offercreatinion occur');
    // }
   
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", offer);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  // Handle new user
  const handleNewUser = async (data) => {
    console.log("Received 'other-user-joined' event with data:", data);
  
    if (!localStreamRef.current) {
      console.warn("Local stream is not ready.");
      return;
    }
    const pc =await initializePeerConnection();
    console.log("Adding local tracks to peer connection...");
  await localStreamRef.current.getTracks().forEach((track) => {
    pc.addTrack(track, localStreamRef.current);
  });
     
    
     createOffer(pc);
  };

  useEffect( () => {
    const  handleSocketEvents = () => {
      socket.on("offer", async (offer) => {
        try {
          let pc = peerConnection;
          if (!pc) {
            // If peerConnection is not initialized, initialize it
            pc =await initializePeerConnection();
            await setPeerConnection(pc);
          }
            // Attach local tracks to the peer connection
            if(!localStreamRef.current){
             
              await setupLocalStream();   
            }
            if(!localStreamRef.current){
              console.error('loclstream is not av')
            }
            if (localStreamRef.current) {
              await localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
              });
            }
          
      
          // Set the remote description and create an answer
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
      
          // Send the answer back to User A
          socket.emit("answer", answer);
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });
      
    
      socket.on("answer", async (answer) => {
        
        const pc = peerConnection ;
        if(pc){
          console.log('answer received', answer);
        }
        try {
          // Avoid setting remote description if already stable
          if (pc.signalingState === "stable") {
            console.warn("Unexpected answer state: already stable. Ignoring...");
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      });
    
      socket.on("iceCandidate", async (candidate) => {
        const pc = peerConnection ;
        if (!pc) {
          console.warn("No PeerConnection available for ICE candidate.");
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('iceCandidte is fatched',candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      });
    };
    

     handleSocketEvents();

    // Cleanup socket events
    return () => {
      socket.off("user-joined", handleNewUser);
      socket.off("offer");
      socket.off("answer");
      socket.off("iceCandidate");
    };
  }, [socket, peerConnection]);

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        remoteStream,
        setupLocalStream,
        setLocalStream,
        setRemoteStream,
        peerConnection,
        setPeerConnection,
        handleNewUser
      }}
    >
      {props.children}
    </WebRTCContext.Provider>
  );
};
