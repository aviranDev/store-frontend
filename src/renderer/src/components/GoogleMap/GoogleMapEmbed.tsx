import styled from 'styled-components'

type GoogleMapEmbedProps = {
  address?: string | null
  height?: number
}

const Frame = styled.iframe<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  border: 0;
  display: block;
  background: #ffffff;
`

const Placeholder = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  padding: 10px;
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

const GoogleMapEmbed = ({ address, height = 220 }: GoogleMapEmbedProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY
  const normalizedAddress = address?.trim()

  if (!normalizedAddress) {
    return <Placeholder $height={height}>No address available to display on the map.</Placeholder>
  }

  if (!apiKey) {
    return <Placeholder $height={height}>Missing Google Maps API key.</Placeholder>
  }

  const src =
    `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(normalizedAddress)}`

  return (
    <Frame
      $height={height}
      title="Customer address map"
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  )
}

export default GoogleMapEmbed
