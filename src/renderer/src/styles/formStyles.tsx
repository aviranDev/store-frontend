import styled from 'styled-components'

interface StyledFormProps {
  $bgc?: string
}

export const FormWrapper = styled.div<{ height?: string }>`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  width: 100vw;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
`

export const LayerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 550px;
  background-color: var(--secondary-color);
  border: 2px solid var(--border-color);
  box-shadow:
    inset -2px -2px 0px #fff,
    inset 2px 2px 0px #000; /* Beveled effect */
`

export const StyledForm = styled.form<StyledFormProps>`
  width: 350px;
  padding: 20px;
  border: 2px solid var(--border-color);
  box-shadow:
    -2px -2px 0px #fff,
    2px 2px 0px #000; /* Beveled effect for retro look */
  color: var(--text-color);
  font-family: 'Courier New', monospace;
`

export const MessageContainer = styled.div<{ $apiFulfill: boolean }>`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
  font-weight: 700;
  margin-top: 10px;
  color: ${({ $apiFulfill }): string =>
    $apiFulfill ? 'var(--primary-color)' : 'var(--error-color)'};
`
