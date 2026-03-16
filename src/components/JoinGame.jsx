import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Chip,
  Divider,
  Stack,
  Paper,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { supabase } from '../lib/supabase'

export default function JoinGame({ onPlayerJoined, initialCode = '' }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [code, setCode] = useState(initialCode.toUpperCase())
  const [gameData, setGameData] = useState(null)
  const [existingPlayers, setExistingPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pre-fill and auto-search if initialCode is provided
  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      handleFindGame(initialCode.toUpperCase())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode])

  const handleFindGame = async (codeToSearch = code) => {
    if (!codeToSearch.trim() || codeToSearch.trim().length < 4) {
      setError('Merci de saisir un code valide (6 caractères).')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', codeToSearch.trim().toUpperCase())
        .single()

      if (gameError || !game) {
        setError('Partie introuvable. Vérifie le code et réessaie.')
        return
      }

      // Fetch existing players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', game.id)
        .order('created_at', { ascending: true })

      if (playersError) throw playersError

      setGameData(game)
      setExistingPlayers(players || [])
      setStep(2)
    } catch (err) {
      setError(err.message || 'Erreur lors de la recherche de la partie.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExistingPlayer = async (player) => {
    setSelectedPlayer(player)
    setLoading(true)
    setError(null)

    try {
      onPlayerJoined({
        playerId: player.id,
        playerName: player.name,
        gameCode: gameData.code,
      })
      navigate(`/game/${gameData.code}`)
    } catch (err) {
      setError(err.message || 'Erreur lors de la sélection du joueur.')
      setLoading(false)
    }
  }

  const handleCreateNewPlayer = async () => {
    if (!newPlayerName.trim()) {
      setError('Merci de saisir ton prénom.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({ game_id: gameData.id, name: newPlayerName.trim() })
        .select()
        .single()

      if (playerError) throw playerError

      onPlayerJoined({
        playerId: playerData.id,
        playerName: playerData.name,
        gameCode: gameData.code,
      })

      navigate(`/game/${gameData.code}`)
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du joueur.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Saisissez le code à 6 caractères partagé par le créateur de la partie.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Code de la partie"
          placeholder="Ex: ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          fullWidth
          disabled={loading}
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', letterSpacing: 4, fontSize: '1.2rem' } }}
          onKeyDown={(e) => e.key === 'Enter' && handleFindGame()}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || code.trim().length < 4}
          onClick={() => handleFindGame()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GroupIcon />}
          sx={{ py: 1.5, fontSize: '1rem' }}
        >
          {loading ? 'Recherche...' : 'Rejoindre'}
        </Button>
      </Box>
    )
  }

  // Step 2: choose or create a player
  return (
    <Box sx={{ mt: 1 }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', borderRadius: 2 }}>
        <Typography variant="subtitle2" color="primary" fontWeight={700}>
          {gameData.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Code : {gameData.code}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {existingPlayers.length > 0 && (
        <>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Joueurs déjà dans la partie
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Clique sur ton prénom si tu es déjà inscrit(e) :
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {existingPlayers.map((player) => (
              <Chip
                key={player.id}
                label={player.name}
                onClick={() => handleSelectExistingPlayer(player)}
                disabled={loading}
                color={selectedPlayer?.id === player.id ? 'primary' : 'default'}
                variant={selectedPlayer?.id === player.id ? 'filled' : 'outlined'}
                sx={{ fontSize: '0.95rem', height: 36 }}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ou
            </Typography>
          </Divider>
        </>
      )}

      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Rejoindre sous un nouveau prénom
      </Typography>

      <TextField
        label="Ton prénom"
        placeholder="Ex: Lucas"
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        fullWidth
        disabled={loading}
        sx={{ mb: 2 }}
        inputProps={{ maxLength: 30 }}
        onKeyDown={(e) => e.key === 'Enter' && handleCreateNewPlayer()}
      />

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !newPlayerName.trim()}
        onClick={handleCreateNewPlayer}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
        sx={{ py: 1.5, fontSize: '1rem' }}
      >
        {loading ? 'Connexion...' : 'Rejoindre la partie'}
      </Button>

      <Button
        variant="text"
        fullWidth
        onClick={() => { setStep(1); setError(null); setGameData(null) }}
        sx={{ mt: 1 }}
        disabled={loading}
      >
        Changer de code
      </Button>
    </Box>
  )
}
