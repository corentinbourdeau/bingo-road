import { useState, useEffect, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { DEPARTMENTS_BY_CODE } from '../lib/departments'

const GEO_URL =
  'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson'

export default function FranceMap({ spottedPlates, players }) {
  const [geoData, setGeoData] = useState(null)
  const [geoLoading, setGeoLoading] = useState(true)
  const [geoError, setGeoError] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setGeoData(data)
        setGeoLoading(false)
      })
      .catch((err) => {
        setGeoError(err.message)
        setGeoLoading(false)
      })
  }, [])

  const spottedMap = useMemo(() => {
    const map = {}
    spottedPlates.forEach((plate) => {
      map[plate.department_code] = plate.players?.name || 'Inconnu'
    })
    return map
  }, [spottedPlates])

  const totalFound = Object.keys(spottedMap).length

  if (geoLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Chargement de la carte…</Typography>
      </Box>
    )
  }

  if (geoError || !geoData) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Impossible de charger la carte : {geoError}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', bgcolor: '#f0f4f8' }}>
      {/* Map */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [2.3, 46.5], scale: 2800 }}
          width={400}
          height={480}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8} center={[2.3, 46.5]}>
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = geo.properties.code
                  const isSpotted = Boolean(spottedMap[code])

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isSpotted ? '#2e7d32' : '#e8e8e8'}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', cursor: 'pointer' },
                        hover: { fill: isSpotted ? '#1b5e20' : '#c8d8e8', outline: 'none', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onClick={() => {
                        const deptInfo = DEPARTMENTS_BY_CODE[code]
                        setTooltip({
                          code,
                          name: deptInfo?.name || geo.properties.nom || code,
                          foundBy: spottedMap[code] || null,
                        })
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </Box>

      {/* Tap tooltip */}
      {tooltip && (
        <Paper
          elevation={3}
          onClick={() => setTooltip(null)}
          sx={{
            position: 'absolute',
            bottom: 64,
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
              sx={{ fontFamily: 'monospace', color: tooltip.foundBy ? 'white' : 'text.secondary' }}
            >
              {tooltip.code}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>{tooltip.name}</Typography>
            {tooltip.foundBy ? (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                Trouvée par {tooltip.foundBy}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">Non trouvée</Typography>
            )}
          </Box>
          {tooltip.foundBy && <CheckCircleIcon color="success" sx={{ fontSize: '1.2rem' }} />}
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
          <Typography variant="caption" color="text.secondary">Trouvée ({totalFound})</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 14, height: 14, bgcolor: '#e8e8e8', border: '1px solid #ccc', borderRadius: 0.5, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary">Non trouvée</Typography>
        </Box>
      </Box>
    </Box>
  )
}
