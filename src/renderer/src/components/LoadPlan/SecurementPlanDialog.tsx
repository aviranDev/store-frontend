import { useState } from 'react'
import styled from 'styled-components'

import WinButton from '../../components/Button/WinButton'
import {
  SecurementConfig,
  SecurementDevice,
  SecurementDeviceType,
  SecurementDirection,
  SecurementSummary,
  SecurementTransportMode
} from '../../Services/loadPlan'

type DeviceDraft = {
  clientId: string
  id: string
  type: SecurementDeviceType
  description: string
  directions: SecurementDirection[]
  effectiveSlidingCapacityKn: string
  effectiveTippingCapacityKnM: string
  verified: boolean
  targetsAllCargo: boolean
}

type SecurementDraft = {
  transportMode: '' | SecurementTransportMode
  frictionCoefficient: string
  longitudinalG: string
  transverseG: string
  verticalAccelerationReductionG: string
  safetyFactor: string
  stackCapacitiesVerified: boolean
  devices: DeviceDraft[]
}

type Props = {
  open: boolean
  isCalculating: boolean
  cargoKeys: string[]
  summary?: SecurementSummary
  requestError?: string
  onClose: () => void
  onCalculate: (config: SecurementConfig) => Promise<void>
}

const createDeviceDraft = (): DeviceDraft => ({
  clientId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: '',
  type: 'direct_lashing',
  description: '',
  directions: [],
  effectiveSlidingCapacityKn: '',
  effectiveTippingCapacityKnM: '',
  verified: false,
  targetsAllCargo: false
})

const createDraft = (): SecurementDraft => ({
  transportMode: '',
  frictionCoefficient: '',
  longitudinalG: '',
  transverseG: '',
  verticalAccelerationReductionG: '',
  safetyFactor: '',
  stackCapacitiesVerified: false,
  devices: []
})

const parseRequiredNumber = (
  value: string,
  label: string,
  options: { min: number; max?: number; maxExclusive?: boolean }
): number => {
  const parsed = Number(value)

  if (!value.trim() || !Number.isFinite(parsed)) {
    throw new Error(`${label} is required.`)
  }

  const aboveMaximum =
    options.max !== undefined &&
    (options.maxExclusive ? parsed >= options.max : parsed > options.max)

  if (parsed < options.min || aboveMaximum) {
    const upperLimit =
      options.max === undefined
        ? ''
        : options.maxExclusive
          ? ` and less than ${options.max}`
          : ` and no more than ${options.max}`

    throw new Error(`${label} must be at least ${options.min}${upperLimit}.`)
  }

  return parsed
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.24);
  box-sizing: border-box;
`

const Window = styled.div`
  width: min(820px, calc(100vw - 32px));
  max-height: min(760px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: ${({ theme }) => theme.colors.face};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
  box-shadow: 2px 2px 0 ${({ theme }) => theme.colors.black};
`

const TitleBar = styled.div`
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 4px 2px 8px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.titleBar};
  color: ${({ theme }) => theme.colors.titleText};
  font-weight: bold;
`

const CloseButton = styled(WinButton)`
  width: 22px;
  min-width: 22px;
  height: 20px;
  padding: 0;
  line-height: 1;
`

const Body = styled.form`
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const ScrollArea = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding: 10px;
`

const Notice = styled.div`
  margin-bottom: 10px;
  padding: 8px;
  line-height: 1.35;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const Section = styled.fieldset`
  min-width: 0;
  margin: 0 0 10px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.dark};
`

const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.label`
  display: grid;
  grid-template-columns: minmax(170px, auto) minmax(0, 1fr);
  align-items: center;
  gap: 8px;
`

const Input = styled.input`
  width: 100%;
  min-width: 0;
  height: 27px;
  padding: 0 5px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const Select = styled.select`
  width: 100%;
  min-width: 0;
  height: 27px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
`

const CheckLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 12px;
`

const DeviceCard = styled.div`
  margin-top: 8px;
  padding: 8px;
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
`

const DeviceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const Directions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
`

const ErrorText = styled.div`
  margin-top: 8px;
  color: #a00000;
  font-weight: bold;
`

const Result = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.inputBg};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const DirectionResult = styled.div`
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.colors.dark};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 10px 10px;
`

const formatStatus = (status: SecurementSummary['status']): string => {
  if (status === 'passed') return 'Passed'
  if (status === 'action_required') return 'Action required'
  return 'Not calculated'
}

const SecurementPlanDialog = ({
  open,
  isCalculating,
  cargoKeys,
  summary,
  requestError,
  onClose,
  onCalculate
}: Props): React.JSX.Element | null => {
  const [draft, setDraft] = useState<SecurementDraft>(createDraft)
  const [validationError, setValidationError] = useState('')

  if (!open) return null

  const updateDraft = <K extends keyof SecurementDraft>(
    field: K,
    value: SecurementDraft[K]
  ): void => {
    setDraft((previous) => ({ ...previous, [field]: value }))
    setValidationError('')
  }

  const updateDevice = (clientId: string, update: (device: DeviceDraft) => DeviceDraft): void => {
    setDraft((previous) => ({
      ...previous,
      devices: previous.devices.map((device) =>
        device.clientId === clientId ? update(device) : device
      )
    }))
    setValidationError('')
  }

  const toggleDirection = (device: DeviceDraft, direction: SecurementDirection): DeviceDraft => ({
    ...device,
    directions: device.directions.includes(direction)
      ? device.directions.filter((item) => item !== direction)
      : [...device.directions, direction]
  })

  const buildConfig = (): SecurementConfig => {
    if (!draft.transportMode) {
      throw new Error('Transport mode is required.')
    }

    const frictionCoefficient = parseRequiredNumber(
      draft.frictionCoefficient,
      'Friction coefficient',
      { min: 0, max: 1 }
    )
    const longitudinalG = parseRequiredNumber(draft.longitudinalG, 'Longitudinal acceleration', {
      min: 0
    })
    const transverseG = parseRequiredNumber(draft.transverseG, 'Transverse acceleration', {
      min: 0
    })
    const verticalAccelerationReductionG = parseRequiredNumber(
      draft.verticalAccelerationReductionG,
      'Vertical acceleration reduction',
      { min: 0, max: 1, maxExclusive: true }
    )

    const devices: SecurementDevice[] = draft.devices.map((device, index) => {
      if (!device.id.trim()) {
        throw new Error(`Device ${index + 1}: identifier is required.`)
      }

      if (device.directions.length === 0) {
        throw new Error(`Device ${index + 1}: select at least one direction.`)
      }

      const effectiveSlidingCapacityKn = parseRequiredNumber(
        device.effectiveSlidingCapacityKn,
        `Device ${index + 1}: effective sliding capacity`,
        { min: 0 }
      )
      const tippingCapacity = device.effectiveTippingCapacityKnM.trim()
        ? parseRequiredNumber(
            device.effectiveTippingCapacityKnM,
            `Device ${index + 1}: effective tipping capacity`,
            { min: 0 }
          )
        : undefined

      return {
        id: device.id.trim(),
        type: device.type,
        description: device.description.trim() || undefined,
        directions: device.directions,
        effectiveSlidingCapacityKn,
        effectiveTippingCapacityKnM: tippingCapacity,
        verified: device.verified,
        cargoKeys: device.targetsAllCargo ? cargoKeys : undefined
      }
    })

    const safetyFactor = draft.safetyFactor.trim()
      ? parseRequiredNumber(draft.safetyFactor, 'Safety factor', { min: 1 })
      : undefined

    return {
      transportMode: draft.transportMode,
      frictionCoefficient,
      accelerationProfile: {
        longitudinalG,
        transverseG,
        verticalAccelerationReductionG
      },
      safetyFactor,
      devices,
      verifiedStackCargoKeys: draft.stackCapacitiesVerified ? cargoKeys : []
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    try {
      setValidationError('')
      await onCalculate(buildConfig())
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message)
      } else {
        setValidationError('Securement inputs are invalid.')
      }
    }
  }

  return (
    <Backdrop onMouseDown={onClose}>
      <Window
        role="dialog"
        aria-modal="true"
        aria-labelledby="securement-plan-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <TitleBar>
          <span id="securement-plan-title">Phase 3 — Securement</span>
          <CloseButton type="button" onClick={onClose} disabled={isCalculating}>
            ×
          </CloseButton>
        </TitleBar>

        <Body onSubmit={handleSubmit}>
          <ScrollArea>
            <Notice>
              This phase evaluates the frozen Closing Plan. It does not move cargo. Enter only
              project-specific values and capacities that have been verified for the actual shipment
              and equipment.
            </Notice>

            <Section>
              <legend>Calculation inputs</legend>
              <Fields>
                <Field>
                  Transport mode
                  <Select
                    value={draft.transportMode}
                    onChange={(event) =>
                      updateDraft(
                        'transportMode',
                        event.target.value as SecurementDraft['transportMode']
                      )
                    }
                  >
                    <option value="">Select...</option>
                    <option value="road">Road</option>
                    <option value="rail">Rail</option>
                    <option value="sea">Sea</option>
                    <option value="multimodal">Multimodal</option>
                  </Select>
                </Field>

                <Field>
                  Friction coefficient
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={draft.frictionCoefficient}
                    onChange={(event) => updateDraft('frictionCoefficient', event.target.value)}
                    placeholder="Required"
                  />
                </Field>

                <Field>
                  Longitudinal acceleration (g)
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.longitudinalG}
                    onChange={(event) => updateDraft('longitudinalG', event.target.value)}
                    placeholder="Required"
                  />
                </Field>

                <Field>
                  Transverse acceleration (g)
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.transverseG}
                    onChange={(event) => updateDraft('transverseG', event.target.value)}
                    placeholder="Required"
                  />
                </Field>

                <Field>
                  Vertical reduction (g)
                  <Input
                    type="number"
                    min="0"
                    max="0.99"
                    step="0.01"
                    value={draft.verticalAccelerationReductionG}
                    onChange={(event) =>
                      updateDraft('verticalAccelerationReductionG', event.target.value)
                    }
                    placeholder="Required"
                  />
                </Field>

                <Field>
                  Safety factor
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={draft.safetyFactor}
                    onChange={(event) => updateDraft('safetyFactor', event.target.value)}
                    placeholder="Optional"
                  />
                </Field>
              </Fields>

              <div style={{ marginTop: 10 }}>
                <CheckLabel>
                  <input
                    type="checkbox"
                    checked={draft.stackCapacitiesVerified}
                    onChange={(event) =>
                      updateDraft('stackCapacitiesVerified', event.target.checked)
                    }
                  />
                  Load-bearing/stack capacities verified for all placed cargo
                </CheckLabel>
              </div>
            </Section>

            <Section>
              <legend>Securing devices</legend>
              <div>
                Add blocking, bracing, dunnage, barriers, locking devices, or lashings only when
                their effective capacity has been established.
              </div>

              {draft.devices.map((device, index) => (
                <DeviceCard key={device.clientId}>
                  <DeviceHeader>
                    <strong>Device {index + 1}</strong>
                    <WinButton
                      type="button"
                      onClick={() =>
                        updateDraft(
                          'devices',
                          draft.devices.filter((item) => item.clientId !== device.clientId)
                        )
                      }
                    >
                      Remove
                    </WinButton>
                  </DeviceHeader>

                  <Fields>
                    <Field>
                      Identifier
                      <Input
                        value={device.id}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            id: event.target.value
                          }))
                        }
                        placeholder="e.g. L1"
                      />
                    </Field>

                    <Field>
                      Type
                      <Select
                        value={device.type}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            type: event.target.value as SecurementDeviceType
                          }))
                        }
                      >
                        <option value="blocking">Blocking</option>
                        <option value="bracing">Bracing</option>
                        <option value="dunnage_bag">Dunnage bag</option>
                        <option value="direct_lashing">Direct lashing</option>
                        <option value="top_over_lashing">Top-over lashing</option>
                        <option value="door_barrier">Door barrier</option>
                        <option value="locking_device">Locking device</option>
                      </Select>
                    </Field>

                    <Field>
                      Sliding capacity (kN)
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={device.effectiveSlidingCapacityKn}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            effectiveSlidingCapacityKn: event.target.value
                          }))
                        }
                        placeholder="Required"
                      />
                    </Field>

                    <Field>
                      Tipping capacity (kN·m)
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={device.effectiveTippingCapacityKnM}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            effectiveTippingCapacityKnM: event.target.value
                          }))
                        }
                        placeholder="Optional"
                      />
                    </Field>

                    <Field>
                      Description
                      <Input
                        value={device.description}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            description: event.target.value
                          }))
                        }
                        placeholder="Optional"
                      />
                    </Field>
                  </Fields>

                  <div style={{ marginTop: 8 }}>
                    <strong>Resists:</strong>{' '}
                    <Directions>
                      {(['front', 'rear', 'left', 'right'] as SecurementDirection[]).map(
                        (direction) => (
                          <CheckLabel key={direction}>
                            <input
                              type="checkbox"
                              checked={device.directions.includes(direction)}
                              onChange={() =>
                                updateDevice(device.clientId, (current) =>
                                  toggleDirection(current, direction)
                                )
                              }
                            />
                            {direction}
                          </CheckLabel>
                        )
                      )}
                    </Directions>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <CheckLabel>
                      <input
                        type="checkbox"
                        checked={device.targetsAllCargo}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            targetsAllCargo: event.target.checked
                          }))
                        }
                      />
                      Device acts on all placed cargo/stacks
                    </CheckLabel>

                    <CheckLabel>
                      <input
                        type="checkbox"
                        checked={device.verified}
                        onChange={(event) =>
                          updateDevice(device.clientId, (current) => ({
                            ...current,
                            verified: event.target.checked
                          }))
                        }
                      />
                      Capacity and application verified
                    </CheckLabel>
                  </div>
                </DeviceCard>
              ))}

              <div style={{ marginTop: 8 }}>
                <WinButton
                  type="button"
                  onClick={() => updateDraft('devices', [...draft.devices, createDeviceDraft()])}
                >
                  Add Device
                </WinButton>
              </div>
            </Section>

            {(validationError || requestError) && (
              <ErrorText>{validationError || requestError}</ErrorText>
            )}

            {summary && (
              <Result>
                <div>
                  <strong>Securement: {formatStatus(summary.status)}</strong>
                </div>
                <div>{summary.conclusion}</div>

                {summary.directionMetrics.length > 0 && (
                  <ResultGrid>
                    {summary.directionMetrics.map((metric) => (
                      <DirectionResult key={metric.direction}>
                        <strong>{metric.direction}</strong>
                        <div>{metric.passed ? 'Passed' : 'Action required'}</div>
                        <div>Margin: {metric.marginKn} kN</div>
                      </DirectionResult>
                    ))}
                  </ResultGrid>
                )}

                {summary.issues.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Issues</strong>
                    <ul>
                      {summary.issues.map((issue, index) => (
                        <li key={`${issue.code}-${index}`}>{issue.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.actions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Required actions</strong>
                    <ul>
                      {summary.actions.map((action, index) => (
                        <li key={`${action.code}-${index}`}>{action.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Result>
            )}
          </ScrollArea>

          <Actions>
            <WinButton type="button" onClick={onClose} disabled={isCalculating}>
              Close
            </WinButton>
            <WinButton type="submit" disabled={isCalculating}>
              {isCalculating ? 'Calculating...' : 'Calculate Securement'}
            </WinButton>
          </Actions>
        </Body>
      </Window>
    </Backdrop>
  )
}

export default SecurementPlanDialog
