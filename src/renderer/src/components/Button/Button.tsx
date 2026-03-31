import React from 'react'
import StyledButton, { ButtonProps } from './buttonStyles'

// Define the Button component
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>
}

export default Button
