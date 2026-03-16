import { useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import {
  Box,
  Typography,
  Paper,
  Chip,
  useTheme,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { DEPARTMENTS_BY_CODE } from '../lib/departments'

const GEO_URL = 'https://france-geojson.gregoiredavid.fr/repo/departements.geojson'

export default function FranceMap({ spottedPlates, players }) {
  const theme = useTheme()
  const [hoveredDept, setHoveredDept] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  // Build a map: code -> playerName
  const spottedMap = useMemo(() => {
    const map = {}
    spottedPlates.forEach((plate) => {
      map[plate.department_code] = plate.players?.name || 'Inconnu'
    })
    return map
  }, [spottedPlates])

  const totalFound = Object.keys(spottedMap).length

  const handleGeoClick = (geo) => {
    const code = geo.properties.code
    const deptInfo = DEPARTMENTS_BY_CODE[code]
    const foundBy = spottedMap[code]
    setTooltip({
      code,
      name: deptInfo?.name || geo.properties.nom || code,
      foundBy: foundBy || null,
    })
  }

  const handleGeoHover = (geo) => {
    setHoveredDept(geo.properties.code)
  }

  const handleGeoLeave = () => {
    setHoveredDept(null)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        bgcolor: '#f0f4f8',
      }}
    >
      {/* Map */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [2.3, 46.5],
            scale: 2800,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={1}
            minZoom={0.8}
            maxZoom={8}
            center={[2.3, 46.5]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code
                  const isSpotted = Boolean(spottedMap[code])
                  const isHovered = hoveredDept === code

                  let fillColor = '#e8e8e8'
                  if (isSpotted) {
                    fillColor = isHovered
                      ? theme.palette.success.dark
                      : theme.palette.success.main
                  } else if (isHovered) {
                    fillColor = '#c8c8c8'
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', cursor: 'pointer' },
                        hover: { outline: 'none', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onClick={() => handleGeoClick(geo)}
                      onMouseEnter={() => handleGeoHover(geo)}
                      onMouseLeave={handleGeoLeave}
                      onTouchStart={() => handleGeoClick(geo)}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </Box>

      {/* Tooltip / Info panel */}
      {tooltip && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 2,
            py: 1.5,
            borderRadius: 2,
            minWidth: 200,
            maxWidth: '90vw',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 20,
            cursor: 'pointer',
          }}
          onClick={() => setTooltip(null)}
        >
          <Box
            sx={{
              minWidth: 40,
              height: 32,
              bgcolor: tooltip.foundBy ? 'success.main' : 'grey.200',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                fontFamily: 'monospace',
                color: tooltip.foundBy ? 'white' : 'text.secondary',
              }}
            >
              {tooltip.code}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {tooltip.name}
            </Typography>
            {tooltip.foundBy ? (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                Trouvée par {tooltip.foundBy}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Non trouvée — appuyez pour cocher dans la liste
              </Typography>
            )}
          </Box>
          {tooltip.foundBy && (
            <CheckCircleIcon color="success" sx={{ fontSize: '1.2rem' }} />
          )}
        </Paper>
      )}

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: 'rgba(255,255,255,0.92)',
          borderRadius: 2,
          px: 1.5,
          py: 1,
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          zIndex: 15,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 14, height: 14, bgcolor: 'success.main', borderRadius: 0.5, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary">
            Trouvée ({totalFound})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 14, height: 14, bgcolor: '#e8e8e8', borderRadius: 0.5, border: '1px solid #ccc', flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary">
            Non trouvée
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
