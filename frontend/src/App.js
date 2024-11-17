import React from 'react';
import Home from './pages/home';
import {BrowserRouter , Route ,Routes} from 'react-router-dom'
import './App.css';
import SocketProvider from './context/socketContext';
import Room from './pages/Room';
import { PeerProvider } from './context/webrtc';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <SocketProvider>
        <PeerProvider>
       <Routes>
           <Route path="/" element={<Home/>}/>
           <Route path="/rooms/:roomId" element ={<Room/>}/>
       
       </Routes>
        </PeerProvider>
       </SocketProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
