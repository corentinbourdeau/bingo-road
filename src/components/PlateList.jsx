import { useMemo } from 'react'
import {
  Box,
  Typography,
  LinearProgress,
  List,
  Paper,
  Divider,
} from '@mui/material'
import PlateItem from './PlateItem'
import { DEPARTMENTS_BY_REGION, DEPARTMENTS } from '../lib/departments'

const TOTAL_PLATES = DEPARTMENTS.length

export default function PlateList({ spottedPlates, onSpot, currentPlayerId, isActive }) {
  // Build a map: code -> { playerName, playerId }
  const spottedMap = useMemo(() => {
    const map = {}
    spottedPlates.forEach((plate) => {
      map[plate.department_code] = {
        playerName: plate.players?.name || 'Inconnu',
        playerId: plate.player_id,
      }
    })
    return map
  }, [spottedPlates])

  const totalFound = spottedPlates.length
  const totalProgress = Math.round((totalFound / TOTAL_PLATES) * 100)

  // Sort regions so "Spécial" is always last
  const sortedRegions = useMemo(() => {
    const regions = Object.keys(DEPARTMENTS_BY_REGION)
    return regions.sort((a, b) => {
      if (a === 'Spécial') return 1
      if (b === 'Spécial') return -1
      return a.localeCompare(b, 'fr')
    })
  }, [])

  return (
    <Box sx={{ pb: 10 }}>
      {/* Total progress */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Progression totale
          </Typography>
          <Typography variant="body2" fontWeight={700} color="primary">
            {totalFound} / {TOTAL_PLATES} plaques trouvées
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalProgress}
          sx={{ height: 8, borderRadius: 4 }}
          color={totalProgress === 100 ? 'success' : 'primary'}
        />
      </Paper>

      {/* Grouped by region */}
      {sortedRegions.map((region) => {
        const depts = DEPARTMENTS_BY_REGION[region]
        const regionFound = depts.filter((d) => spottedMap[d.code]).length
        const regionTotal = depts.length
        const regionProgress = Math.round((regionFound / regionTotal) * 100)

        return (
          <Box key={region}>
            {/* Region header */}
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: 'grey.50',
                position: 'sticky',
                top: 72,
                zIndex: 9,
                borderTop: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {region}
                </Typography>
                <Typography variant="caption" fontWeight={600} color={regionFound === regionTotal ? 'success.main' : 'text.secondary'}>
                  {regionFound}/{regionTotal}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={regionProgress}
                sx={{ height: 4, borderRadius: 2 }}
                color={regionFound === regionTotal ? 'success' : 'primary'}
              />
            </Box>

            {/* Department list */}
            <List disablePadding sx={{ px: 1, pt: 0.5, pb: 0.5 }}>
              {depts.map((dept) => {
                const spotted = spottedMap[dept.code]
                return (
                  <PlateItem
                    key={dept.code}
                    department={dept}
                    spottedBy={spotted?.playerName || null}
                    onSpot={onSpot}
                    isActive={isActive}
                    isCurrentPlayer={spotted?.playerId === currentPlayerId}
                  />
                )
              })}
            </List>
          </Box>
        )
      })}
    </Box>
  )
}
