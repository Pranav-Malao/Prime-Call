import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

function Room() {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ name, id }) => {
    console.log(`User ${name} joined room`);
    alert(`User ${name} joined room !!`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user-call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      console.log(`Incoming Call`, from, offer);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call-accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    try {
      if (!myStream) return;

      let alertShown = false; 

      for (const track of myStream.getTracks()) {
        if (!peer.peer.getSenders().some(sender => sender.track === track)) {
          peer.peer.addTrack(track, myStream);
        } else {
          if (!alertShown) { 
            console.log("The track has already been added to the peer connection");
            window.alert("The track has already been added to the peer connection");
            alertShown = true; 
          }
        }
      }
    } catch (err) {
      console.log("Error while adding Track", err);
    }
  }, [myStream, peer.peer]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer-nego-needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer-nego-done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);


  useEffect(() => {
    socket.on('user-joined', handleUserJoined);
    socket.on('incoming-call', handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("peer-nego-needed", handleNegoNeedIncomming);
    socket.on("peer-nego-final", handleNegoNeedFinal);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('incoming-call', handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("peer-nego-needed", handleNegoNeedIncomming);
      socket.off("peer-nego-final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);


  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Accept</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            height="150px"
            width="200px"
            className="border-2 border-white"
            url={myStream}
            style={{transform: "scaleX(-1)"}}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            // muted
            height="150px"
            width="200px"
            url={remoteStream}
            style={{transform: "scaleX(-1)"}}
          />
        </>
      )}
    </div>
  );
}

export default Room