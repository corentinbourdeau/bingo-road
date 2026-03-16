import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useGame(gameCode) {
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [spottedPlates, setSpottedPlates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!gameCode) return

    let isMounted = true

    async function fetchGameData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch game by code
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('code', gameCode)
          .single()

        if (gameError) throw gameError
        if (!isMounted) return

        setGame(gameData)

        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameData.id)
          .order('created_at', { ascending: true })

        if (playersError) throw playersError
        if (!isMounted) return

        setPlayers(playersData || [])

        // Fetch spotted plates with player names
        const { data: platesData, error: platesError } = await supabase
          .from('spotted_plates')
          .select('*, players(name)')
          .eq('game_id', gameData.id)
          .order('spotted_at', { ascending: true })

        if (platesError) throw platesError
        if (!isMounted) return

        setSpottedPlates(platesData || [])

        // Set up realtime subscriptions
        const channel = supabase
          .channel(`game-${gameData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'spotted_plates',
              filter: `game_id=eq.${gameData.id}`,
            },
            async (payload) => {
              if (!isMounted) return

              // Avoid duplicates
              setSpottedPlates((prev) => {
                const alreadyExists = prev.some(
                  (p) => p.department_code === payload.new.department_code
                )
                if (alreadyExists) return prev

                // Fetch player name for this new plate
                supabase
                  .from('players')
                  .select('name')
                  .eq('id', payload.new.player_id)
                  .single()
                  .then(({ data }) => {
                    if (!isMounted) return
                    const newPlate = {
                      ...payload.new,
                      players: data || { name: 'Inconnu' },
                    }
                    setSpottedPlates((current) => {
                      const exists = current.some(
                        (p) => p.department_code === newPlate.department_code
                      )
                      if (exists) return current
                      return [...current, newPlate]
                    })
                  })

                return prev
              })
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'players',
              filter: `game_id=eq.${gameData.id}`,
            },
            (payload) => {
              if (!isMounted) return
              setPlayers((prev) => {
                const exists = prev.some((p) => p.id === payload.new.id)
                if (exists) return prev
                return [...prev, payload.new]
              })
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'games',
              filter: `id=eq.${gameData.id}`,
            },
            (payload) => {
              if (!isMounted) return
              setGame(payload.new)
            }
          )
          .subscribe()

        channelRef.current = channel
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Une erreur est survenue')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchGameData()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [gameCode])

  const spotPlate = async (departmentCode, playerId) => {
    if (!game) return { error: 'Partie non trouvée' }

    const { data, error } = await supabase
      .from('spotted_plates')
      .insert({
        game_id: game.id,
        player_id: playerId,
        department_code: departmentCode,
      })
      .select('*, players(name)')
      .single()

    if (error) {
      // If unique constraint violation, plate already spotted by someone else
      if (error.code === '23505') {
        return { error: 'Cette plaque a déjà été trouvée !' }
      }
      return { error: error.message }
    }

    return { data }
  }

  const finishGame = async () => {
    if (!game) return { error: 'Partie non trouvée' }

    const { data, error } = await supabase
      .from('games')
      .update({ status: 'finished' })
      .eq('id', game.id)
      .select()
      .single()

    if (error) return { error: error.message }

    setGame(data)
    return { data }
  }

  return {
    game,
    players,
    spottedPlates,
    loading,
    error,
    spotPlate,
    finishGame,
  }
}
