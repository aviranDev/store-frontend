import { ChangeEvent, useLayoutEffect, useRef, useState } from 'react'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import WinButton from '../../components/Button/WinButton'
import {
  TabContentLayout,
  TabFooter,
  AssistantTop,
  AgentMessages,
  AgentMessageBubble,
  AgentInputRow,
  AgentInput
} from '../../styles/LoadPlanStyle/LoadPlanStyle'

type Props = {
  message: string
  previewDataExists: boolean
  warnings: string[]
  errors: string[]
  onBack: () => void
}

const LoadPlanAssistantPanel = (_props: Props): React.JSX.Element => {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const resizeInput = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 150)}px`
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
    resizeInput(event.target)
  }

  useLayoutEffect(() => {
    if (inputRef.current) {
      resizeInput(inputRef.current)
    }
  }, [])

  return (
    <TabContentLayout>
      <AssistantTop>
        <Win95GroupBox legend="AI Agent">
          <AgentMessages>
            <AgentMessageBubble $role="assistant">
              Hello. I can help explain fit results, stacking rules, and cargo placement.
            </AgentMessageBubble>
          </AgentMessages>

          <AgentInputRow>
            <AgentInput
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask the AI agent..."
              rows={1}
            />

            <WinButton type="button">Send</WinButton>
          </AgentInputRow>
        </Win95GroupBox>
      </AssistantTop>

      <TabFooter>
        <WinButton type="button" onClick={_props.onBack}>
          Back
        </WinButton>
      </TabFooter>
    </TabContentLayout>
  )
}

export default LoadPlanAssistantPanel