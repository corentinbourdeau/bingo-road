import { Box, ListItemButton, Typography, Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

export default function PlateItem({ department, spottedBy, onSpot, isActive, isCurrentPlayer }) {
  const isSpotted = Boolean(spottedBy)

  const handleClick = () => {
    if (!isSpotted && isActive && onSpot) {
      onSpot(department.code)
    }
  }

  return (
    <ListItemButton
      onClick={handleClick}
      disabled={isSpotted || !isActive}
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
        '&:hover': isSpotted
          ? {}
          : {
              bgcolor: isActive ? 'primary.50' : 'background.paper',
              borderColor: isActive ? 'primary.300' : 'divider',
            },
        '&.Mui-disabled': {
          opacity: isSpotted ? 1 : 0.5,
        },
        cursor: isSpotted || !isActive ? 'default' : 'pointer',
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
      <Box sx={{ ml: 1, flexShrink: 0 }}>
        {isSpotted ? (
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
              maxWidth: 120,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        ) : (
          <RadioButtonUncheckedIcon
            sx={{
              color: isActive ? 'grey.400' : 'grey.300',
              fontSize: '1.2rem',
            }}
          />
        )}
      </Box>
    </ListItemButton>
  )
}
