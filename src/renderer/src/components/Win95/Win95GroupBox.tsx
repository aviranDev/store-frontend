import { ReactNode } from 'react'
import styled from 'styled-components'

const GroupBox = styled.fieldset`
  margin: 0;
  padding: 14px 14px 16px;
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`

const GroupLegend = styled.legend`
  padding: 0 6px;
  font-weight: normal;
`
const GroupBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 8px;
`

type Win95GroupBoxProps = {
  legend?: string
  children: ReactNode
  className?: string
}

const Win95GroupBox = ({ legend, children, className }: Win95GroupBoxProps) => {
  return (
    <GroupBox className={className}>
      {legend ? <GroupLegend>{legend}</GroupLegend> : null}
      <GroupBody>{children}</GroupBody>
    </GroupBox>
  )
}

export default Win95GroupBox
