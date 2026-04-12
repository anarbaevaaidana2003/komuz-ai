import { useRef, useEffect, useState } from 'react'
import usePlayerStore from '../store/playerStore'
import './AudioPlayer.css'

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer() {
  const { currentTrack, isPlaying, pause, resume, stop, next } = usePlayerStore()
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dragging, setDragging] = useState(false)

  // Управление воспроизведением при смене трека или isPlaying
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (audio.src !== currentTrack.audio_url) {
      audio.src = currentTrack.audio_url
      audio.load()
      audio.play().catch(() => {})
    } else if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [currentTrack, isPlaying])

  function onTimeUpdate() {
    if (!dragging) setCurrentTime(audioRef.current.currentTime)
  }

  function onLoadedMetadata() {
    setDuration(audioRef.current.duration)
  }

  function onEnded() {
    next()
  }

  function onProgressClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const newTime = ratio * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />

      <div className="audio-player__track">
        <div className="audio-player__wave">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className={`audio-player__wave-bar ${isPlaying ? 'playing' : ''}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <div className="audio-player__info">
          <p className="audio-player__prompt">{currentTrack.prompt}</p>
          <p className="audio-player__meta">{currentTrack.duration}с · {currentTrack.status}</p>
        </div>
      </div>

      <div className="audio-player__controls">
        <button
          className="audio-player__btn"
          onClick={isPlaying ? pause : resume}
          aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="audio-player__progress" onClick={onProgressClick} role="progressbar">
          <div className="audio-player__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <span className="audio-player__time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button className="audio-player__btn" onClick={stop} aria-label="Стоп">
          ✕
        </button>
      </div>
    </div>
  )
}
