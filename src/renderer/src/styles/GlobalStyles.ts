// styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  body {
    font-family: Tahoma, "MS Sans Serif", sans-serif;
    background: #008080; /* classic desktop teal */
    color: #000;
    font-size: 14px;
    user-select: none;
    overflow: hidden;
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: 14px;
  }
`
