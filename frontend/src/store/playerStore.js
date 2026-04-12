import { create } from 'zustand'

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],

  play(track) {
    set({ currentTrack: track, isPlaying: true })
  },

  pause() {
    set({ isPlaying: false })
  },

  resume() {
    if (get().currentTrack) {
      set({ isPlaying: true })
    }
  },

  stop() {
    set({ currentTrack: null, isPlaying: false })
  },

  addToQueue(track) {
    set((state) => {
      const alreadyIn = state.queue.some((t) => t.id === track.id)
      if (alreadyIn) return state
      return { queue: [...state.queue, track] }
    })
  },

  next() {
    const { currentTrack, queue } = get()
    if (!currentTrack || queue.length === 0) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const nextTrack = queue[idx + 1] ?? queue[0]
    set({ currentTrack: nextTrack, isPlaying: true })
  },

  clearQueue() {
    set({ queue: [], currentTrack: null, isPlaying: false })
  },
}))

export default usePlayerStore
