import React, { useState, useCallback, useEffect } from 'react'
import { useSocket } from '../context/SocketProvider';

function Room() {
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const socket = useSocket();

  const handleUserJoined = useCallback(({ name, id }) => {
    console.log(`User ${name} joined room`);
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    socket.on('user-joined', handleUserJoined);

    return () => {
      socket.off('user-joined', handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return (
    <>
      <div>room</div>
      <h3>{remoteSocketId ? 'Connected' : 'No one in the room'}</h3>
    </>
  )
}

export default Room