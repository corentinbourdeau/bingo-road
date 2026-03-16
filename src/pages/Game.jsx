import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material'
import ListAltIcon from '@mui/icons-material/ListAlt'
import MapIcon from '@mui/icons-material/Map'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PlateList from '../components/PlateList'
import FranceMap from '../components/FranceMap'
import ScoreBoard from '../components/ScoreBoard'
import PlayerChip from '../components/PlayerChip'
import { useGame } from '../hooks/useGame'
import { usePlayer } from '../hooks/usePlayer'
import { DEPARTMENTS } from '../lib/departments'

const TOTAL_PLATES = DEPARTMENTS.length

export default function Game() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { player, setPlayer } = usePlayer()
  const [tabIndex, setTabIndex] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [codeCopied, setCodeCopied] = useState(false)

  const { game, players, spottedPlates, loading, error, spotPlate, finishGame } = useGame(code)

  // Redirect if no player session for this game
  useEffect(() => {
    if (!loading && game && player?.gameCode !== code) {
      navigate(`/?code=${code}`, { replace: true })
    }
  }, [loading, game, player, code, navigate])

  // Redirect to home if game not found after loading
  useEffect(() => {
    if (!loading && error && error.includes('No rows')) {
      navigate('/', { replace: true })
    }
  }, [loading, error, navigate])

  const handleSpotPlate = async (departmentCode) => {
    if (!player?.playerId) {
      setSnackbar({ open: true, message: 'Identifiant joueur manquant.', severity: 'error' })
      return
    }

    const { error: spotError } = await spotPlate(departmentCode, player.playerId)
    if (spotError) {
      setSnackbar({ open: true, message: spotError, severity: 'warning' })
    } else {
      setSnackbar({ open: true, message: `Plaque ${departmentCode} trouvée !`, severity: 'success' })
    }
  }

  const handleShare = async () => {
    const shareText = `Rejoins notre partie Route Bingo ! Code : ${code}\n${window.location.origin}/game/${code}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Route Bingo', text: shareText })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      setSnackbar({ open: true, message: 'Lien copié !', severity: 'success' })
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleOpenStats = () => {
    navigate(`/game/${code}/stats`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !game) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!game) return null

  const isActive = game.status === 'active'
  const totalFound = spottedPlates.length
  const progress = `${totalFound}/${TOTAL_PLATES}`

  // Compute scores for players panel
  const playerScores = {}
  players.forEach((p) => { playerScores[p.id] = 0 })
  spottedPlates.forEach((plate) => {
    if (playerScores[plate.player_id] !== undefined) {
      playerScores[plate.player_id]++
    }
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* AppBar */}
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{ lineHeight: 1.2, fontSize: '0.95rem' }}
            >
              {game.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
              <Tooltip title={codeCopied ? 'Copié !' : 'Copier le code'}>
                <Chip
                  label={code}
                  size="small"
                  onClick={handleCopyCode}
                  icon={<ContentCopyIcon sx={{ fontSize: '0.75rem !important' }} />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: 1,
                    height: 22,
                    cursor: 'pointer',
                    '& .MuiChip-icon': { color: 'white' },
                  }}
                />
              </Tooltip>
              <Chip
                label={isActive ? 'En cours' : 'Terminée'}
                size="small"
                sx={{
                  bgcolor: isActive ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>
          </Box>

          {/* Progress chip */}
          <Chip
            label={progress}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          />

          {/* Share button */}
          <IconButton color="inherit" onClick={handleShare} size="small">
            <ShareIcon />
          </IconButton>

          {/* Stats button */}
          <IconButton color="inherit" onClick={handleOpenStats} size="small">
            <BarChartIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Game not active banner */}
      {!isActive && (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          Cette partie est terminée. Vous êtes en mode lecture.
        </Alert>
      )}

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Liste tab */}
        {tabIndex === 0 && (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <PlateList
              spottedPlates={spottedPlates}
              onSpot={handleSpotPlate}
              currentPlayerId={player?.playerId}
              isActive={isActive}
            />
          </Box>
        )}

        {/* Carte tab */}
        {tabIndex === 1 && (
          <Box sx={{ height: '100%' }}>
            <FranceMap spottedPlates={spottedPlates} players={players} />
          </Box>
        )}

        {/* Joueurs tab */}
        {tabIndex === 2 && (
          <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            {/* Player chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {players.map((p) => (
                <PlayerChip
                  key={p.id}
                  name={p.name}
                  score={playerScores[p.id] || 0}
                  isCurrentPlayer={p.id === player?.playerId}
                />
              ))}
            </Box>
            <ScoreBoard
              players={players}
              spottedPlates={spottedPlates}
              currentPlayerId={player?.playerId}
            />
          </Box>
        )}
      </Box>

      {/* Bottom Navigation */}
      <Paper elevation={8} sx={{ zIndex: 100 }}>
        <BottomNavigation
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        >
          <BottomNavigationAction label="Liste" icon={<ListAltIcon />} />
          <BottomNavigationAction label="Carte" icon={<MapIcon />} />
          <BottomNavigationAction label="Joueurs" icon={<PeopleIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
