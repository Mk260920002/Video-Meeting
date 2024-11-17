import React, { createContext,useMemo } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext(null);

export const useSocket = () => {
  return React.useContext(SocketContext);
};

const SocketProvider = (props) => {
  const socket = useMemo(() => io("http://localhost:5000"), []);


  return (
    <SocketContext.Provider value={{ socket}}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;