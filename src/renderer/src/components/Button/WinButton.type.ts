import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  size?: 'default' | 'small' | 'icon'
  fullWidth?: boolean
}

export type WinButtonProps = {
  $size?: 'default' | 'small' | 'icon'
  $fullWidth?: boolean
}

export default Props
