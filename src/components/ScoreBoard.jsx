import { useMemo } from 'react'
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  Avatar,
  Divider,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { DEPARTMENTS } from '../lib/departments'

const TOTAL_PLATES = DEPARTMENTS.length

const MEDALS = ['🥇', '🥈', '🥉']

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function ScoreBoard({ players, spottedPlates, currentPlayerId }) {
  // Compute score per player
  const playerScores = useMemo(() => {
    const scores = {}
    players.forEach((p) => { scores[p.id] = 0 })
    spottedPlates.forEach((plate) => {
      if (scores[plate.player_id] !== undefined) {
        scores[plate.player_id]++
      }
    })
    return scores
  }, [players, spottedPlates])

  // Sort players by score descending
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (playerScores[b.id] || 0) - (playerScores[a.id] || 0))
  }, [players, playerScores])

  const totalFound = spottedPlates.length

  // Last spotted plate
  const lastPlate = useMemo(() => {
    if (spottedPlates.length === 0) return null
    return [...spottedPlates].sort(
      (a, b) => new Date(b.spotted_at) - new Date(a.spotted_at)
    )[0]
  }, [spottedPlates])

  const lastPlayerName = useMemo(() => {
    if (!lastPlate) return null
    const player = players.find((p) => p.id === lastPlate.player_id)
    return player?.name || lastPlate.players?.name || 'Inconnu'
  }, [lastPlate, players])

  return (
    <Box sx={{ pb: 4 }}>
      {/* Global stats header */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" fontWeight={600} color="primary.dark">
            Plaques trouvées
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {totalFound} / {TOTAL_PLATES}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.round((totalFound / TOTAL_PLATES) * 100)}
          sx={{ height: 8, borderRadius: 4 }}
          color={totalFound === TOTAL_PLATES ? 'success' : 'primary'}
        />
      </Paper>

      {/* Last spotted plate */}
      {lastPlate && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'success.50',
            border: '1px solid',
            borderColor: 'success.200',
            borderRadius: 2,
          }}
        >
          <AccessTimeIcon color="success" sx={{ fontSize: '1.1rem' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Dernière plaque trouvée
            </Typography>
            <Typography variant="body2" fontWeight={700} color="success.dark">
              {lastPlate.department_code} — par {lastPlayerName}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {formatDate(lastPlate.spotted_at)}
          </Typography>
        </Paper>
      )}

      {/* Scoreboard */}
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, px: 0.5 }}>
        Classement
      </Typography>

      <List disablePadding>
        {sortedPlayers.map((player, index) => {
          const score = playerScores[player.id] || 0
          const pct = totalFound > 0 ? Math.round((score / TOTAL_PLATES) * 100) : 0
          const isCurrentPlayer = player.id === currentPlayerId
          const medal = MEDALS[index] || null

          return (
            <Paper
              key={player.id}
              elevation={0}
              sx={{
                mb: 1,
                border: '1px solid',
                borderColor: isCurrentPlayer ? 'primary.300' : 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: isCurrentPlayer ? 'primary.50' : 'background.paper',
              }}
            >
              <ListItem
                sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                {/* Rank */}
                <Box
                  sx={{
                    minWidth: 32,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {medal ? (
                    <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{medal}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      {index + 1}
                    </Typography>
                  )}
                </Box>

                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: isCurrentPlayer ? 'primary.main' : 'grey.300',
                    fontSize: '1rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </Avatar>

                {/* Name + progress */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                    <Typography
                      variant="body2"
                      fontWeight={isCurrentPlayer ? 700 : 600}
                      color={isCurrentPlayer ? 'primary.dark' : 'text.primary'}
                      noWrap
                    >
                      {player.name}
                      {isCurrentPlayer && (
                        <Typography component="span" variant="caption" color="primary" sx={{ ml: 0.75 }}>
                          (moi)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color={isCurrentPlayer ? 'primary.main' : 'text.primary'}>
                      {score}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ flex: 1, height: 5, borderRadius: 3 }}
                      color={isCurrentPlayer ? 'primary' : 'success'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>
                      {pct}%
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            </Paper>
          )
        })}
      </List>

      {players.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          Aucun joueur dans cette partie.
        </Typography>
      )}
    </Box>
  )
}
