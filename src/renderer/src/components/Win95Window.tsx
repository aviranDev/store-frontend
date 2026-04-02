// components/Win95Window.tsx
import styled from 'styled-components'
import { raisedBox } from '../styles/mixins'

export const Window = styled.div`
  width: 720px;
  max-width: 95vw;
  background: ${({ theme }) => theme.colors.windowBg};
  ${raisedBox};
  display: flex;
  flex-direction: column;
`

export const TitleBar = styled.div`
  height: 30px;
  background: ${({ theme }) => theme.colors.titleBar};
  color: ${({ theme }) => theme.colors.titleText};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  font-weight: bold;
`

export const Title = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TitleButtons = styled.div`
  display: flex;
  gap: 2px;
`

export const TitleButton = styled.button`
  width: 24px;
  height: 22px;
  padding: 0;
  background: ${({ theme }) => theme.colors.face};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:active {
    border-top: 2px solid #404040;
    border-left: 2px solid #404040;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
  }
`

export const WindowBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`
