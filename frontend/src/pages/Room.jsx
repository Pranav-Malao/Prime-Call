import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

function Room() {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  // const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ name, id }) => {
    console.log(`User ${name} joined room`);
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
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const myVideoRef = useRef(null);

  useEffect(() => {
    socket.on('user-joined', handleUserJoined);
    socket.on('incoming-call', handleIncommingCall);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('incoming-call', handleIncommingCall);

    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall
  ]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {/* {myStream && <button onClick={sendStreams}>Send Stream</button>} */}
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
      {/* {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )} */}
    </div>
  );
}

export default Room