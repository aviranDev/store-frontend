import { useState } from 'react'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import WinButton from '../../components/Button/WinButton'
import {
  AssistantPanelWrap,
  AssistantTop,
  AssistantBottom,
  AgentMessages,
  AgentMessageBubble,
  AgentInputRow,
  AgentInput,
  MessagesList,
  MessageItem
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

type Props = {
  message: string
  previewDataExists: boolean
  warnings: string[]
  errors: string[]
}

const LoadPlanAssistantPanel = ({
  message,
  previewDataExists,
  warnings,
  errors
}: Props): React.JSX.Element => {
  const [input, setInput] = useState('')

  return (
    <AssistantPanelWrap>
      <AssistantTop>
        <Win95GroupBox legend="AI Agent">
          <AgentMessages>
            <AgentMessageBubble $role="assistant">
              Hello. I can help explain fit results, stacking rules, and cargo placement.
            </AgentMessageBubble>
          </AgentMessages>

          <AgentInputRow>
            <AgentInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI agent..."
            />
            <WinButton type="button">Send</WinButton>
          </AgentInputRow>
        </Win95GroupBox>
      </AssistantTop>

      <AssistantBottom>
        <Win95GroupBox legend="Messages">
          <MessagesList>
            {message && <MessageItem $type="normal">{message}</MessageItem>}

            {!previewDataExists && !message && (
              <MessageItem $type="normal">No preview calculated yet.</MessageItem>
            )}

            {previewDataExists && errors.length === 0 && warnings.length === 0 && !message && (
              <MessageItem $type="normal">No warnings or errors.</MessageItem>
            )}

            {errors.map((error, index) => (
              <MessageItem key={`error-${index}`} $type="error">
                Error: {error}
              </MessageItem>
            ))}

            {warnings.map((warning, index) => (
              <MessageItem key={`warning-${index}`} $type="warning">
                Warning: {warning}
              </MessageItem>
            ))}
          </MessagesList>
        </Win95GroupBox>
      </AssistantBottom>
    </AssistantPanelWrap>
  )
}

export default LoadPlanAssistantPanel
