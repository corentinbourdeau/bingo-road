import { Box, ListItemButton, Typography, Chip, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CloseIcon from '@mui/icons-material/Close'

export default function PlateItem({ department, spottedBy, onSpot, onUnspot, isActive }) {
  const isSpotted = Boolean(spottedBy)

  const handleClick = () => {
    if (!isSpotted && isActive && onSpot) {
      onSpot(department.code)
    }
  }

  const handleUnspot = (e) => {
    e.stopPropagation()
    if (onUnspot) onUnspot(department.code)
  }

  return (
    <ListItemButton
      onClick={handleClick}
      // Never disable when spotted — otherwise pointer-events:none blocks child buttons
      disabled={!isSpotted && !isActive}
      disableRipple={isSpotted}
      sx={{
        minHeight: 56,
        borderRadius: 2,
        mb: 0.5,
        px: 2,
        py: 1,
        bgcolor: isSpotted ? 'success.50' : 'background.paper',
        border: '1px solid',
        borderColor: isSpotted ? 'success.200' : 'divider',
        cursor: isSpotted ? 'default' : isActive ? 'pointer' : 'default',
        '&:hover': isSpotted
          ? {}
          : { bgcolor: isActive ? 'primary.50' : 'background.paper', borderColor: isActive ? 'primary.300' : 'divider' },
        '&.Mui-disabled': { opacity: 0.5 },
        transition: 'all 0.15s ease',
      }}
    >
      {/* Department code badge */}
      <Box
        sx={{
          minWidth: 48,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isSpotted ? 'success.main' : 'grey.100',
          borderRadius: 1,
          mr: 1.5,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.95rem',
            color: isSpotted ? 'white' : 'text.primary',
            letterSpacing: 0.5,
          }}
        >
          {department.code}
        </Typography>
      </Box>

      {/* Department name */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={isSpotted ? 600 : 400}
          sx={{
            color: isSpotted ? 'success.dark' : 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {department.name}
        </Typography>
      </Box>

      {/* Status indicator */}
      <Box sx={{ ml: 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isSpotted ? (
          <>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
              label={spottedBy}
              size="small"
              color="success"
              variant="filled"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                maxWidth: 110,
                '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />
            {isActive && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleUnspot}
                startIcon={<CloseIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{
                  minWidth: 0,
                  px: 0.75,
                  py: 0.25,
                  fontSize: '0.7rem',
                  height: 24,
                  lineHeight: 1,
                  borderRadius: 1.5,
                  '& .MuiButton-startIcon': { mr: 0.25 },
                }}
              >
                Annuler
              </Button>
            )}
          </>
        ) : (
          <RadioButtonUncheckedIcon sx={{ color: isActive ? 'grey.400' : 'grey.300', fontSize: '1.2rem' }} />
        )}
      </Box>
    </ListItemButton>
  )
}
