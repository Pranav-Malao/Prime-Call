import { Routes, Route } from 'react-router-dom'
import Lobby from './pages/Lobby'
import Room from './pages/room'

function App() {

  return (
    <div className="App w-screen h-screen bg-[#141414]">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:id" element={<Room/>} />
      </Routes>
    </div>
  )
}

export default App
