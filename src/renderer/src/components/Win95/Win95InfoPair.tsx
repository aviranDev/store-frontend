import styled from 'styled-components'

const Row = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px 10px;
  align-items: center;
  margin-bottom: 8px;
`

const InfoLabel = styled.span`
  font-weight: bold;
`

const InfoValue = styled.div`
  min-height: 28px;
  padding: 4px 6px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: center;
`

type Win95InfoPairProps = {
  label: string
  value: string
  className?: string
}

const Win95InfoPair = ({ label, value, className }: Win95InfoPairProps) => {
  return (
    <Row className={className}>
      <InfoLabel>{label}</InfoLabel>
      <InfoValue>{value}</InfoValue>
    </Row>
  )
}

export default Win95InfoPair
