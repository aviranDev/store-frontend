import styled from 'styled-components'
import WinButton from '../../components/Button/WinButton'

const CONTROL_HEIGHT = '28px'

const TableGrid = `
   92px
  48px
  52px
  12px
  52px
  12px
  52px
  62px
  58px
  62px
  28px
`

const CompactTableGrid = `
  72px
  38px
  46px
  8px
  46px
  8px
  46px
  52px
  44px
  44px
  28px
`

export const ContainerFrame = styled.div<{
  $left: number
  $top: number
  $width: number
  $height: number
}>`
  position: absolute;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  width: ${({ $width }) => `${$width}px`};
  height: ${({ $height }) => `${$height}px`};
  border: 2px solid #000;
  background-color: #ffffff;
  background-image:
    linear-gradient(to right, #d9d9d9 1px, transparent 1px),
    linear-gradient(to bottom, #d9d9d9 1px, transparent 1px);
  background-size: 20px 20px;
  box-sizing: border-box;
`

export const DeleteIcon = styled.img`
  width: 14px;
  height: 14px;
  image-rendering: pixelated;
  pointer-events: none;
`

export const DeleteButton = styled(WinButton)`
  width: 28px;
  min-width: 28px;
  height: ${CONTROL_HEIGHT};
  min-height: ${CONTROL_HEIGHT};
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export const TabContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
  height: 100%;
  width: 100%;
  max-width: none;
  min-width: 0;
`

export const TabFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: auto;
`

export const FormPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

export const CargoTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

export const CargoHeader = styled.div`
  display: grid;
  grid-template-columns: ${TableGrid};
  column-gap: 6px;
  align-items: end;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
  min-width: 0;

  @media (max-width: 1500px) {
    grid-template-columns: ${CompactTableGrid};
    column-gap: 4px;
    font-size: 12px;
  }
`

export const HeaderCell = styled.div`
  min-width: 0;
`

export const DimensionsHeader = styled.div`
  grid-column: 3 / span 5;
  text-align: center;
  min-width: 0;
`

export const CargoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const CargoRow = styled.div`
  display: grid;
  grid-template-columns: ${TableGrid};
  column-gap: 6px;
  align-items: center;
  min-width: 0;

  > * {
    min-width: 0;
    margin: 0;
  }

  @media (max-width: 1500px) {
    grid-template-columns: ${CompactTableGrid};
    column-gap: 4px;
  }
`

export const RestrictionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 6px 10px;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.windowBg};
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  min-width: 0;

  @media (max-width: 1500px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 8px;
    padding: 7px 8px;
  }
`

export const RestrictionItem = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  min-width: 0;
`

export const DimSeparator = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: ${CONTROL_HEIGHT};
  font-size: 14px;
  line-height: 1;

  @media (max-width: 1500px) {
    width: 8px;
  }
`

export const NativeSelect = styled.select`
  width: 100%;
  min-width: 0;
  height: ${CONTROL_HEIGHT};
  min-height: ${CONTROL_HEIGHT};
  box-sizing: border-box;
  margin: 0;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  outline: none;
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 14px;
  padding: 0 4px;

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }

  @media (max-width: 1500px) {
    font-size: 12px;
    padding: 0 2px;
  }
`

export const CargoInput = styled.input`
  width: 100%;
  min-width: 0;
  height: ${CONTROL_HEIGHT};
  min-height: ${CONTROL_HEIGHT};
  box-sizing: border-box;
  margin: 0;
  padding: 0 6px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  outline: none;
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 14px;
  line-height: 1;

  &::placeholder {
    color: ${({ theme }) => theme.colors.shadow};
  }

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }

  @media (max-width: 1500px) {
    font-size: 12px;
    padding: 0 4px;
  }
`

export const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto 180px auto auto;
  align-items: center;
  gap: 10px;
  width: fit-content;
  min-width: 0;

  @media (max-width: 1500px) {
    grid-template-columns: auto auto minmax(130px, 1fr) auto auto;
    gap: 6px;
    width: 100%;
  }
`

export const SectionLabel = styled.label`
  font-size: 14px;
  white-space: nowrap;
`

export const PreviewWrap = styled.div`
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 10px;
  height: 100%;
  min-height: 0;
  width: 100%;
`

export const PreviewTop = styled.div`
  min-height: 0;
  overflow: hidden;
`

export const PreviewBottom = styled.div`
  min-height: 0;
  overflow: hidden;
`

export const PreviewViewport = styled.div`
  min-height: 0;
  height: 100%;
  background: #f3f3f3;
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  padding: 6px;
  box-sizing: border-box;
  overflow: auto;
`

export const PlaceholderText = styled.div`
  text-align: center;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
`

export const SummaryGrid = styled.div`
  display: grid;
  gap: 8px;

  @media (max-height: 760px) {
    gap: 5px;
  }
`

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;

  @media (max-height: 760px) {
    font-size: 12px;
  }
`

export const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const MessageItem = styled.div<{ $type: 'error' | 'warning' | 'normal' }>`
  font-size: 12px;
  line-height: 1.35;
  color: ${({ $type, theme }) =>
    $type === 'error' ? theme.colors.text || theme.colors.text : theme.colors.text};
`

export const PlanCanvasWrap = styled.div`
  height: 100%;
  display: flex;
  min-height: 0;
  min-width: 0;
  align-items: center;
  justify-content: center;
  overflow: auto;
`

export const PlanCanvas = styled.div<{
  $width?: number
  $height?: number
}>`
  position: relative;
  width: ${({ $width = 620 }) => `${$width}px`};
  height: ${({ $height = 260 }) => `${$height}px`};
  overflow: hidden;
  margin: 0 auto;
  flex: 0 0 auto;
`

export const PlanBlock = styled.div<{
  $left: number
  $top: number
  $width: number
  $height: number
  $isStacked: boolean
  $isPallet: boolean
  $color: string
}>`
  position: absolute;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  width: ${({ $width }) => `${Math.max($width, 6)}px`};
  height: ${({ $height }) => `${Math.max($height, 6)}px`};
  border: 1px solid #000;
  background: ${({ $color }) => $color};
  opacity: ${({ $isStacked }) => ($isStacked ? 0.88 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  text-align: center;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  color: #111111;
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.35);
`

export const RightPanelsLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  gap: 12px;
  align-items: stretch;
  height: 100%;
  min-height: 0;
  width: 100%;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(360px, 1fr) minmax(260px, auto);
    overflow-y: auto;
  }
`

export const AssistantPanelWrap = styled.div`
  display: grid;
  grid-template-rows: minmax(0, 1fr) minmax(120px, 150px);
  gap: 12px;
  height: 100%;
  min-height: 0;
`

export const AssistantTop = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

export const AssistantBottom = styled.div`
  min-height: 0;
  overflow: hidden;
`

export const AgentMessages = styled.div`
  flex: 1;
  min-height: 420px;
  overflow-y: auto;
  padding: 8px;
  background: #ffffff;
  border: 2px inset #c0c0c0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;

  @media (max-height: 760px) {
    min-height: 340px;
  }
`

export const AgentMessageBubble = styled.div<{ $role: 'user' | 'assistant' }>`
  align-self: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 90%;
  padding: 6px 8px;
  border: 2px outset #c0c0c0;
  background: ${({ $role }) => ($role === 'user' ? '#dcdcdc' : '#efefef')};
  font-size: 12px;
  line-height: 1.4;
`

export const AgentInputRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 8px;
  margin-top: 8px;
  flex-shrink: 0;
`

export const AgentInput = styled.textarea`
  min-width: 0;
  width: 100%;
  min-height: 30px;
  max-height: 260px;
  padding: 6px 8px;
  border: 2px inset #c0c0c0;
  background: #ffffff;
  font-size: 12px;
  font-family: inherit;
  line-height: 1.35;
  resize: vertical;
  overflow-y: auto;
  box-sizing: border-box;
`

export const PreviewHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  min-width: 0;
`

export const PreviewHeaderTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
`

export const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`

export const PreviewModeButtons = styled.div`
  display: inline-flex;
  gap: 6px;
  flex-shrink: 0;
`

export const PreviewModeButton = styled(WinButton)<{ $active: boolean }>`
  min-width: 46px;
  padding: 0 10px;
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
`

export const SceneWrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #f8f8f8;
  border: 2px inset #c0c0c0;
  overflow: hidden;
  box-sizing: border-box;
`

export const SceneLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 8px;
  font-size: 12px;
`

export const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

export const LegendSwatch = styled.span<{ $color: string; $border?: string }>`
  width: 12px;
  height: 12px;
  display: inline-block;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border ?? '#666'};
  box-sizing: border-box;
`
