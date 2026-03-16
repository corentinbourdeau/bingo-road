import { Chip, Avatar } from '@mui/material'

export default function PlayerChip({ name, score, isCurrentPlayer }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'

  return (
    <Chip
      avatar={
        <Avatar
          sx={{
            bgcolor: isCurrentPlayer ? 'primary.main' : 'grey.400',
            color: 'white !important',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          {initial}
        </Avatar>
      }
      label={`${name} · ${score}`}
      variant={isCurrentPlayer ? 'outlined' : 'filled'}
      color={isCurrentPlayer ? 'primary' : 'default'}
      size="medium"
      sx={{
        fontWeight: isCurrentPlayer ? 700 : 400,
        fontSize: '0.85rem',
        height: 34,
        border: isCurrentPlayer ? 2 : 1,
        borderColor: isCurrentPlayer ? 'primary.main' : 'transparent',
      }}
    />
  )
}
