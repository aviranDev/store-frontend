import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

type FileMenuProps = {
  onAccount: () => void
  onLogout: () => void
  onExit?: () => void
}

export default function FileMenu({ onAccount, onLogout, onExit }: FileMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <MenuWrapper ref={menuRef}>
      <MenuButton type="button" $open={open} onClick={() => setOpen((prev) => !prev)}>
        File
      </MenuButton>

      {open && (
        <Dropdown role="menu" aria-label="File menu">
          <MenuItem
            type="button"
            onClick={() => {
              setOpen(false)
              onAccount()
            }}
          >
            Account
          </MenuItem>

          <Separator />

          {onExit && (
            <MenuItem
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
            >
              Exit
            </MenuItem>
          )}
        </Dropdown>
      )}
    </MenuWrapper>
  )
}

const MenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`

const MenuButton = styled.button<{ $open: boolean }>`
  border: 1px solid transparent;
  background: ${({ $open }) => ($open ? '#c0c0c0' : 'transparent')};
  color: #000;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  padding: 0;

  ${({ $open }) =>
    $open &&
    `
      border-top: 1px solid #808080;
      border-left: 1px solid #808080;
      border-right: 1px solid #ffffff;
      border-bottom: 1px solid #ffffff;
    `}

  &:hover {
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #808080;
    border-bottom: 1px solid #808080;
    background: #c0c0c0;
  }
`

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: #c0c0c0;
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #000000;
  border-bottom: 2px solid #000000;
  box-shadow: 1px 1px 0 #808080;
  padding: 2px;
  z-index: 999;
`

const MenuItem = styled.button`
  width: 100%;
  display: block;
  border: none;
  background: #c0c0c0;
  color: #000;
  text-align: left;
  padding: 6px 24px 6px 10px;
  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #000080;
    color: #ffffff;
  }
`

const Separator = styled.div`
  height: 2px;
  margin: 3px 2px;
  background: linear-gradient(to bottom, #808080 0, #808080 1px, #ffffff 1px, #ffffff 2px);
`
