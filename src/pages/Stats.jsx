import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ScoreBoard from '../components/ScoreBoard'
import FranceMap from '../components/FranceMap'
import { useGame } from '../hooks/useGame'
import { usePlayer } from '../hooks/usePlayer'

export default function Stats() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { player, clearPlayer } = usePlayer()
  const { game, players, spottedPlates, loading, error, finishGame } = useGame(code)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState(null)

  const handleBack = () => {
    navigate(`/game/${code}`)
  }

  const handleNewGame = () => {
    clearPlayer(code)
    navigate('/')
  }

  const handleFinishGame = async () => {
    setFinishing(true)
    setFinishError(null)
    const { error: finishErr } = await finishGame()
    if (finishErr) {
      setFinishError(finishErr)
    }
    setFinishing(false)
    setFinishDialogOpen(false)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !game) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Partie introuvable.'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </Box>
    )
  }

  const isActive = game.status === 'active'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              Résultats
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }} noWrap>
              {game.name}
            </Typography>
          </Box>
          <Chip
            icon={<EmojiEventsIcon sx={{ fontSize: '1rem !important', color: 'white !important' }} />}
            label={`${spottedPlates.length} trouvées`}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700 }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {finishError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {finishError}
          </Alert>
        )}

        {/* Status badge */}
        {!isActive && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Partie terminée ! Voici le classement final.
          </Alert>
        )}

        {/* ScoreBoard */}
        <ScoreBoard
          players={players}
          spottedPlates={spottedPlates}
          currentPlayerId={player?.playerId}
        />

        <Divider sx={{ my: 3 }} />

        {/* France Map */}
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Carte des départements trouvés
        </Typography>
        <Box
          sx={{
            height: 320,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f0f4f8',
          }}
        >
          <FranceMap spottedPlates={spottedPlates} players={players} />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 4 }}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Retour à la partie
          </Button>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleNewGame}
            startIcon={<AddCircleOutlineIcon />}
          >
            Nouvelle partie
          </Button>

          {isActive && (
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              onClick={() => setFinishDialogOpen(true)}
              startIcon={<StopCircleIcon />}
            >
              Terminer la partie
            </Button>
          )}
        </Box>
      </Box>

      {/* Confirm finish dialog */}
      <Dialog open={finishDialogOpen} onClose={() => setFinishDialogOpen(false)}>
        <DialogTitle>Terminer la partie ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cette action est irréversible. La partie sera gelée et plus personne ne pourra ajouter de plaques.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishDialogOpen(false)} disabled={finishing}>
            Annuler
          </Button>
          <Button
            onClick={handleFinishGame}
            color="error"
            variant="contained"
            disabled={finishing}
            startIcon={finishing ? <CircularProgress size={16} color="inherit" /> : <StopCircleIcon />}
          >
            {finishing ? 'En cours...' : 'Terminer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
