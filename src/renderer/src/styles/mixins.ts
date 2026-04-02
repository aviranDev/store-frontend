// styles/mixins.ts
import { css } from 'styled-components'

export const raisedBox = css`
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  box-shadow:
    inset -1px -1px 0 #808080,
    inset 1px 1px 0 #dfdfdf;
`

export const sunkenBox = css`
  border-top: 2px solid #404040;
  border-left: 2px solid #404040;
  border-right: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  box-shadow:
    inset 1px 1px 0 #808080,
    inset -1px -1px 0 #dfdfdf;
`
