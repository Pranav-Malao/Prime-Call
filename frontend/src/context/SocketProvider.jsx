import React, {createContext, useMemo} from 'react'
import {io} from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => React.useContext(SocketContext);
function SocketProvider({children}) {

  // Vite does not use process.env by default. Use import.meta.env instead.
  const socket = useMemo(() => io(`http://localhost:${import.meta.env.VITE_SERVER_PORT || 3000}`), []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider;