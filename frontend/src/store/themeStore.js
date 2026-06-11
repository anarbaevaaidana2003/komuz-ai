import { create } from 'zustand'

const saved = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', saved)

const useThemeStore = create((set) => ({
  theme: saved,
  toggle() {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return { theme: next }
    })
  },
}))

export default useThemeStore
