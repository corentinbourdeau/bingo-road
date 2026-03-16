import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useGame(gameCode) {
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [spottedPlates, setSpottedPlates] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const gameIdRef = useRef(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!gameCode) return

    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', gameCode)
        .single()

      if (gameError) throw gameError

      setGame(gameData)
      gameIdRef.current = gameData.id

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameData.id)
        .order('created_at', { ascending: true })

      if (playersError) throw playersError
      setPlayers(playersData || [])

      const { data: platesData, error: platesError } = await supabase
        .from('spotted_plates')
        .select('*, players(name)')
        .eq('game_id', gameData.id)
        .order('spotted_at', { ascending: true })

      if (platesError) throw platesError
      setSpottedPlates(platesData || [])
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      if (isRefresh) setRefreshing(false)
      else setLoading(false)
    }
  }, [gameCode])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  const refresh = useCallback(() => fetchData(true), [fetchData])

  const spotPlate = async (departmentCode, playerId) => {
    if (!gameIdRef.current) return { error: 'Partie non trouvée' }

    const { data, error } = await supabase
      .from('spotted_plates')
      .insert({
        game_id: gameIdRef.current,
        player_id: playerId,
        department_code: departmentCode,
      })
      .select('*, players(name)')
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'Cette plaque a déjà été trouvée !' }
      return { error: error.message }
    }

    setSpottedPlates((prev) => {
      const exists = prev.some((p) => p.department_code === departmentCode)
      return exists ? prev : [...prev, data]
    })

    return { data }
  }

  const unspotPlate = async (departmentCode) => {
    if (!gameIdRef.current) return { error: 'Partie non trouvée' }

    const { error } = await supabase
      .from('spotted_plates')
      .delete()
      .eq('game_id', gameIdRef.current)
      .eq('department_code', departmentCode)

    if (error) return { error: error.message }

    setSpottedPlates((prev) => prev.filter((p) => p.department_code !== departmentCode))
    return {}
  }

  const finishGame = async () => {
    if (!gameIdRef.current) return { error: 'Partie non trouvée' }

    const { data, error } = await supabase
      .from('games')
      .update({ status: 'finished' })
      .eq('id', gameIdRef.current)
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
    refreshing,
    error,
    refresh,
    spotPlate,
    unspotPlate,
    finishGame,
  }
}
