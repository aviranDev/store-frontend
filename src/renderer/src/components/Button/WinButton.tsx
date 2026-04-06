import { WinButton as StyledWinButton } from './WinButton.style'
import Props from './WinButton.type'

const WinButton = ({ children, size = 'default', fullWidth = false, ...props }: Props) => {
  return (
    <StyledWinButton $size={size} $fullWidth={fullWidth} {...props}>
      {children}
    </StyledWinButton>
  )
}

export default WinButton
