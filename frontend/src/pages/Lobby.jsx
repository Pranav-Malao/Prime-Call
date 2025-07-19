import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketProvider.jsx'

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function Lobby() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleGenerateRoomId = (e) => {
    e.preventDefault();
    setRoomId(generateRoomId());
  };

  const socket = useSocket();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    socket.emit('join-room', { name, roomId });
  }, [socket, name, roomId]);

  const handleJoinRoom = useCallback(
    (data) => {
      const { name, roomId } = data;
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-room", handleJoinRoom);
    return () => {
      socket.off("joined-room", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (

    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 border border-gray-300 rounded-lg shadow">
        <h1 className="text-center w-full mb-3 border-b-2">Lobby</h1>
        <h2 className='text-bold text-3xl mb-2'>Join a Room</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                required
                onChange={e => setName(e.target.value)}
                className="ml-2 w-7/10 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
              />
            </label>
          </div>
          <div className="mb-4 flex items-center">
            <label className="flex-1 flex items-center">
              Room ID:
              <input
                type="text"
                value={roomId}
                required
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                className="ml-2 w-5/6 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter or generate Room ID"
              />
            </label>
            <button
              onClick={handleGenerateRoomId}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              type="button"
            >
              Generate
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 font-bold bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>

  );
}

export default Lobby;