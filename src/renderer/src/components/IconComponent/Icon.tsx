import styled from 'styled-components'

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 70px 260px;
  column-gap: 6px;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 0 auto 6px;
`

const HeaderIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 26px;
`

const HeaderText = styled.span`
  display: flex;
  align-items: center;
  height: 26px;
  font-weight: normal;
`

const Icon = styled.img`
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
  flex-shrink: 0;
  display: block;
`
type IconComponentProps = {
  keyIcon: string
  text: string
}

function IconComponent({ keyIcon, text }: IconComponentProps): React.JSX.Element {
  return (
    <HeaderRow>
      <HeaderIconWrap>
        <Icon src={keyIcon} alt="" />
      </HeaderIconWrap>
      <HeaderText>{text}</HeaderText>
    </HeaderRow>
  )
}

export default IconComponent
