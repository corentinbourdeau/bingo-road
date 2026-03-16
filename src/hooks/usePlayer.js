import { useState } from 'react'

const STORAGE_KEY = 'route-bingo-player'

export function usePlayer() {
  const [player, setPlayerState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const setPlayer = (playerData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData))
    setPlayerState(playerData)
  }

  const clearPlayer = (gameCode) => {
    // Only clear if it matches current game
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const current = stored ? JSON.parse(stored) : null
      if (!gameCode || current?.gameCode === gameCode) {
        localStorage.removeItem(STORAGE_KEY)
        setPlayerState(null)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setPlayerState(null)
    }
  }

  return { player, setPlayer, clearPlayer }
}
