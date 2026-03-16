import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { supabase } from '../lib/supabase'

export default function CreateGame({ onPlayerCreated }) {
  const navigate = useNavigate()
  const [gameName, setGameName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gameName.trim() || !playerName.trim()) {
      setError('Merci de remplir tous les champs.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Generate a 6-char uppercase code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create the game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({ name: gameName.trim(), code })
        .select()
        .single()

      if (gameError) throw gameError

      // Create the player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({ game_id: gameData.id, name: playerName.trim() })
        .select()
        .single()

      if (playerError) throw playerError

      // Notify parent and navigate
      onPlayerCreated({
        playerId: playerData.id,
        playerName: playerData.name,
        gameCode: code,
      })

      navigate(`/game/${code}`)
    } catch (err) {
      setError(err.message || 'Impossible de créer la partie. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Créez une nouvelle partie et partagez le code avec vos compagnons de route.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Nom de la partie"
        placeholder="Ex: Vacances Bretagne 2025"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        fullWidth
        required
        disabled={loading}
        sx={{ mb: 2 }}
        inputProps={{ maxLength: 60 }}
      />

      <TextField
        label="Ton prénom"
        placeholder="Ex: Marie"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        fullWidth
        required
        disabled={loading}
        sx={{ mb: 3 }}
        inputProps={{ maxLength: 30 }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !gameName.trim() || !playerName.trim()}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DirectionsCarIcon />}
        sx={{ py: 1.5, fontSize: '1rem' }}
      >
        {loading ? 'Création...' : 'Créer la partie'}
      </Button>
    </Box>
  )
}
