import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  LinearProgress,
  List,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import PlateItem from './PlateItem'
import { DEPARTMENTS_BY_REGION, DEPARTMENTS } from '../lib/departments'

const TOTAL_PLATES = DEPARTMENTS.length

export default function PlateList({ spottedPlates, onSpot, onUnspot, currentPlayerId, isActive }) {
  const [search, setSearch] = useState('')

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

  const query = search.trim().toLowerCase()

  // Sort regions so "Spécial" is always last
  const sortedRegions = useMemo(() => {
    const regions = Object.keys(DEPARTMENTS_BY_REGION)
    return regions.sort((a, b) => {
      if (a === 'Spécial') return 1
      if (b === 'Spécial') return -1
      return a.localeCompare(b, 'fr')
    })
  }, [])

  // When searching, flatten and filter; otherwise group by region
  const isSearching = query.length > 0

  const filteredDepts = useMemo(() => {
    if (!isSearching) return null
    return DEPARTMENTS.filter(
      (d) =>
        d.code.toLowerCase().startsWith(query) ||
        d.name.toLowerCase().includes(query) ||
        d.region.toLowerCase().includes(query)
    )
  }, [isSearching, query])

  return (
    <Box sx={{ pb: 10 }}>
      {/* Sticky top bar: progress + search */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
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
            {totalFound} / {TOTAL_PLATES} trouvées
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalProgress}
          sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
          color={totalProgress === 100 ? 'success' : 'primary'}
        />
        <TextField
          size="small"
          placeholder="Rechercher par numéro ou nom…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          autoComplete="off"
          inputProps={{ inputMode: 'text' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1.1rem', color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')} edge="end">
                  <ClearIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Paper>

      {/* Search results */}
      {isSearching ? (
        <Box sx={{ px: 1, pt: 1 }}>
          {filteredDepts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
              Aucun département trouvé pour « {search} »
            </Typography>
          ) : (
            <List disablePadding>
              {filteredDepts.map((dept) => {
                const spotted = spottedMap[dept.code]
                return (
                  <PlateItem
                    key={dept.code}
                    department={dept}
                    spottedBy={spotted?.playerName || null}
                    onSpot={onSpot}
                    onUnspot={onUnspot}
                    isActive={isActive}
                    isCurrentPlayer={spotted?.playerId === currentPlayerId}
                  />
                )
              })}
            </List>
          )}
        </Box>
      ) : (
        /* Grouped by region */
        sortedRegions.map((region) => {
          const depts = DEPARTMENTS_BY_REGION[region]
          const regionFound = depts.filter((d) => spottedMap[d.code]).length
          const regionTotal = depts.length
          const regionProgress = Math.round((regionFound / regionTotal) * 100)

          return (
            <Box key={region}>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: 'grey.50',
                  position: 'sticky',
                  top: 130,
                  zIndex: 9,
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {region}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color={regionFound === regionTotal ? 'success.main' : 'text.secondary'}
                  >
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

              <List disablePadding sx={{ px: 1, pt: 0.5, pb: 0.5 }}>
                {depts.map((dept) => {
                  const spotted = spottedMap[dept.code]
                  return (
                    <PlateItem
                      key={dept.code}
                      department={dept}
                      spottedBy={spotted?.playerName || null}
                      onSpot={onSpot}
                      onUnspot={onUnspot}
                      isActive={isActive}
                      isCurrentPlayer={spotted?.playerId === currentPlayerId}
                    />
                  )
                })}
              </List>
            </Box>
          )
        })
      )}
    </Box>
  )
}
