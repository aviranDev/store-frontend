// src/components/AdminPanelItem.tsx
import React from 'react'
import {
  AdminItem,
  AdminItemLabel,
  AdminItemImage
} from '../../styles/DashboardStyle/DashboardPage.styles'

type AdminPanelItemProps = {
  label: string
  image: string
  onClick?: () => void
  onHover?: () => void
  onLeave?: () => void
}

function PanelItem({
  label,
  image,
  onClick,
  onHover,
  onLeave
}: AdminPanelItemProps): React.JSX.Element {
  return (
    <AdminItem
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label={label}
      title={label}
    >
      <AdminItemImage src={image} alt={label} />
      <AdminItemLabel>{label}</AdminItemLabel>
    </AdminItem>
  )
}

export default PanelItem
