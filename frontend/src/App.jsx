import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AudioPlayer from './components/AudioPlayer'
import AuthModal from './components/AuthModal'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Generate from './pages/Generate'
import Dashboard from './pages/Dashboard'
import Playlists from './pages/Playlists'
import Gallery from './pages/Gallery'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AuthModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <Generate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <Playlists />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AudioPlayer />
    </BrowserRouter>
  )
}
