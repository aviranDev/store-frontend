import styled from 'styled-components'
import { raisedBox, sunkenBox } from '../mixins'
import { Window, TitleBar, WindowBody } from '../../components/Win95/Win95Window'

export const AdminWindow = styled(Window)`
  width: 920px;
  max-width: 96vw;
  min-height: 575px;
`

export const AdminTitleBar = styled(TitleBar)``

export const AdminMenuBar = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  // padding: 4px 8px;
  background: ${({ theme }) => theme.colors.face};
  border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
  font-size: 14px;
`

export const AdminMenuItem = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: 2px;
  }
`

export const AdminBody = styled(WindowBody)`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
`

export const AdminFrame = styled.div`
  background: #ffffff;
  margin: 8px;
  // padding: 12px;
  ${sunkenBox};
  // min-height: 500px;
  box-sizing: border-box;
`

export const AdminWorkspace = styled.div`
  background: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.shadow};
  padding: 18px 20px 24px;
  min-height: 460px;
  box-sizing: border-box;
`

export const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 110px);
  gap: 22px 26px;
  justify-content: center;
`

export const AdminItem = styled.button`
  width: 110px;
  min-height: 90px;
  background: transparent;
  border: none;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  cursor: pointer;
  font: inherit;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: 2px;
  }
`

export const AdminItemPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  background: #ffffff;
  ${raisedBox};
`

export const AdminItemLabel = styled.span`
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  word-break: break-word;
`

export const AdminStatusBar = styled.div`
  ${sunkenBox};
  background: ${({ theme }) => theme.colors.face};
  padding: 4px 8px;
  font-size: 12px;
  min-height: 24px;
  display: flex;
  align-items: center;
`
export const AdminToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.face};
  border-top: 1px solid ${({ theme }) => theme.colors.light};
  border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
`

export const PanelSelectWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const PanelSelectLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`
export const PanelSelectBox = styled.div`
  position: relative;
  width: 190px;
  height: 24px;
  box-sizing: border-box;
`

export const PanelSelectButton = styled.button`
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  background: #ffffff;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  border: none;
  cursor: pointer;
  box-sizing: border-box;

  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }
`

export const PanelSelectText = styled.span`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 6px;
  font-size: 12px;
  text-align: left;
`

export const PanelSelectArrow = styled.div`
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.face};
  color: ${({ theme }) => theme.colors.text};
  font-size: 9px;
  line-height: 1;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;

  border-top: 1px solid ${({ theme }) => theme.colors.light};
  border-left: 1px solid ${({ theme }) => theme.colors.light};
  border-right: 1px solid ${({ theme }) => theme.colors.shadow};
  border-bottom: 1px solid ${({ theme }) => theme.colors.shadow};
`
export const PanelOptionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.face};
  z-index: 20;
  box-sizing: border-box;

  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.shadow};
  border-bottom: 2px solid ${({ theme }) => theme.colors.shadow};
`
export const PanelOption = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 24px;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  background: ${({ $active, theme }) =>
    $active ? (theme.colors.titleBar ?? '#000080') : theme.colors.face};
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.text)};
  border: none;
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.colors.titleBar ?? '#000080'};
    color: #ffffff;
  }
`
export const AdminItemImage = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  display: block;
`
