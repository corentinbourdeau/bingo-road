import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CreateGame from '../components/CreateGame'
import JoinGame from '../components/JoinGame'
import { usePlayer } from '../hooks/usePlayer'

export default function Home() {
  const navigate = useNavigate()
  const { player, setPlayer } = usePlayer()
  const [tab, setTab] = useState(0)

  const handlePlayerCreated = ({ playerId, playerName, gameCode }) => {
    setPlayer({ playerId, playerName, gameCode })
  }

  const handlePlayerJoined = ({ playerId, playerName, gameCode }) => {
    setPlayer({ playerId, playerName, gameCode })
  }

  const handleResume = () => {
    navigate(`/game/${player.gameCode}`)
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: { xs: 5, sm: 7 },
          pb: { xs: 4, sm: 5 },
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{ letterSpacing: -1, mb: 0.5, fontSize: { xs: '2rem', sm: '2.5rem' } }}
        >
          🚗 Route Bingo
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, fontSize: '1rem' }}>
          Repérez les plaques de département
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
        {/* Resume banner */}
        {player?.gameCode && (
          <Alert
            severity="info"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={handleResume}
                fontWeight={700}
              >
                Reprendre
              </Button>
            }
          >
            <Typography variant="body2" fontWeight={600}>
              Partie en cours : <strong>{player.gameCode}</strong>
            </Typography>
            <Typography variant="caption">
              Joueur : {player.playerName}
            </Typography>
          </Alert>
        )}

        {/* Main card */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { py: 1.75, fontWeight: 600 },
            }}
          >
            <Tab
              icon={<AddCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />}
              iconPosition="start"
              label="Créer"
            />
            <Tab
              icon={<GroupAddIcon sx={{ fontSize: '1.1rem' }} />}
              iconPosition="start"
              label="Rejoindre"
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tab === 0 && (
              <CreateGame onPlayerCreated={handlePlayerCreated} />
            )}
            {tab === 1 && (
              <JoinGame onPlayerJoined={handlePlayerJoined} />
            )}
          </Box>
        </Paper>

        {/* Footer info */}
        <Typography
          variant="caption"
          color="text.disabled"
          textAlign="center"
          display="block"
          sx={{ mt: 4 }}
        >
          Route Bingo — jeu de repérage de plaques de départements français
        </Typography>
      </Container>
    </Box>
  )
}
