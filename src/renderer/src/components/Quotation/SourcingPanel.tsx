import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import WinButton from '../Button/WinButton'
import {
  applyTariff,
  downloadBlob,
  getSourcing,
  runSourcing,
  saveRfq,
  type RFQ,
  type Sourcing
} from '../../Services/freight'
import {
  Badge,
  Box,
  Input,
  Label,
  Notice,
  Pre,
  TextArea,
  Toolbar,
  dateText,
  errorText
} from './common'
const labels: Record<string, string> = {
  needs_details: 'Review shipment to continue',
  tariff_available: 'Tariff available',
  agent_rfq: 'Ready for agent RFQ — draft prepared',
  no_agent: 'No matching agent'
}
export function SourcingBadge({
  status,
  valid,
  decision
}: {
  status?: string
  valid?: boolean
  decision?: string
}) {
  if (!status) return <Badge>○ Sourcing not evaluated</Badge>
  if (status === 'running') return <Badge>● Evaluating tariffs & agents</Badge>
  if (status === 'stale') return <Badge>⚠ Re-evaluate sourcing</Badge>
  if (status === 'error') return <Badge>⚠ Sourcing error</Badge>
  return valid ? (
    <Badge>✓ Ready to quote — tariff costs checked</Badge>
  ) : (
    <Badge>
      {decision === 'agent_rfq' ? '✓' : '⚠'} {labels[decision || ''] || 'Review required'}
    </Badge>
  )
}
export default function SourcingPanel({
  id,
  locked,
  onApplied,
  onReview,
  admin = false,
  refreshKey = 0
}: {
  onReview?: () => void
  admin?: boolean
  refreshKey?: number
  id: string
  locked: boolean
  onApplied: () => void
}) {
  const navigate = useNavigate()
  const [source, setSource] = useState<Sourcing>()
  const [history, setHistory] = useState<Sourcing[]>([])
  const [revision, setRevision] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<RFQ | null>(null)
  const editingRef = useRef(false)
  const sequence = useRef(0)
  const historyRun = useRef<string | null>(null)
  const refresh = useCallback(async () => {
    const seq = ++sequence.current
    try {
      const data = await getSourcing(id)
      if (seq === sequence.current && !editingRef.current) {
        setSource(data.sourcing)
        setRevision(data.revision)
        const run = data.sourcing?.runId || ''
        if (historyRun.current !== run) {
          const archived = await getSourcing(id, true)
          if (seq === sequence.current && !editingRef.current) {
            setHistory(archived.history || [])
            historyRun.current = run
          }
        }
      }
    } catch (e) {
      if (seq === sequence.current) setError(errorText(e))
    }
  }, [id])
  useEffect(() => {
    void refresh()
    const timer = window.setInterval(
      () => {
        if (!editingRef.current) void refresh()
      },
      source?.status === 'running' ? 1000 : 5000
    )
    return () => {
      window.clearInterval(timer)
      sequence.current++
    }
  }, [refresh, source?.status, refreshKey])
  async function act(task: () => Promise<unknown>) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await task()
      editingRef.current = false
      setEditing(null)
      await refresh()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  const stale = source?.status !== 'complete'
  const result = source?.result
  const disabled = busy || locked || source?.status === 'running' || !!editing
  const done = source?.steps.filter((s) => s.status === 'complete').length || 0
  function eml(draft: RFQ) {
    const subject = draft.subject.replace(/[\r\n]/g, ' ')
    const payload = `To: ${draft.agent.email}\r\nSubject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r\nX-Unsent: 1\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${btoa(
      unescape(encodeURIComponent(draft.body))
    )
      .match(/.{1,76}/g)
      ?.join('\r\n')}\r\n`
    downloadBlob(
      new Blob([payload], { type: 'message/rfc822' }),
      `RFQ-${draft.agent.company.replace(/[^a-z0-9]/gi, '-')}.eml`
    )
  }
  return (
    <Box>
      <Toolbar>
        <h3>Rates & agent drafts</h3>
        <SourcingBadge status={source?.status} valid={result?.valid} decision={result?.decision} />
        <WinButton disabled={disabled} onClick={() => void act(() => runSourcing(id))}>
          Refresh rates & agents
        </WinButton>
      </Toolbar>
      {error && <Notice role="alert">{error}</Notice>}
      {source?.error && <Notice>⚠ {source.error}</Notice>}
      {source && (
        <>
          {source.status === 'running' && (
            <progress
              style={{ width: '100%' }}
              aria-label="Sourcing progress"
              value={done}
              max={Math.max(4, source.steps.length)}
            />
          )}
          <details open={source.status === 'running'}>
            <summary>
              {source.status === 'running' ? 'Checking rates and agents…' : 'View processing steps'}
            </summary>
            <ol aria-live="polite">
              {source.steps.map((step) => (
                <li key={step.key}>
                  {step.status === 'complete' ? '✓' : step.status === 'error' ? '⚠' : '●'}{' '}
                  <strong>{step.label}</strong> · {dateText(step.at)}
                  {step.note && <div>{step.note}</div>}
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
      {source?.status === 'stale' && (
        <Notice>
          Shipment details or active catalog versions changed. This result and its RFQs are retained
          for reference; evaluate again before using them.
        </Notice>
      )}
      {result && (
        <>
          <details>
            <summary>Shipment checks and requirements for the completed quotation</summary>
            <p>
              Incoterm: <strong>{result.incoterm.code}</strong> ·{' '}
              {result.incoterm.status === 'valid'
                ? '✓ Consistency checks passed'
                : '⚠ Requires confirmation'}
            </p>
            {!!(result.missingInformation ?? result.blockers).length && (
              <Notice>
                <strong>Information still needed for the completed quotation</strong>
                <ul>
                  {(result.missingInformation ?? result.blockers).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Notice>
            )}
            {!!result.reviewRequired?.length && (
              <Notice>
                <strong>Review still needed for the completed quotation</strong>
                <ul>
                  {result.reviewRequired.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Notice>
            )}
            {!!result.warnings.length && (
              <Notice>
                <strong>Cargo and sourcing checks</strong>
                <ul>
                  {result.warnings.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Notice>
            )}
          </details>
          {!!result.offers.length && <h4>Available tariff costs</h4>}
          {result.offers.map((offer) => (
            <Box key={offer.id} style={{ marginBottom: 10 }}>
              <strong>
                {offer.tariff} · {offer.supplier}
              </strong>
              <p>
                Valid to {offer.validTo} · Source version {offer.sourceBatch}
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      {[
                        'Charge',
                        'Rate / unit',
                        'Quantity',
                        'Minimum',
                        'Calculated amount',
                        'Source row'
                      ].map((h) => (
                        <th key={h} style={{ padding: 6, textAlign: 'left' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {offer.lines.map((l, i) => (
                      <tr key={i}>
                        <td>{l.charge}</td>
                        <td>
                          {l.currency} {l.rate} / {l.unit}
                        </td>
                        <td>{l.quantity}</td>
                        <td>{l.minimum}</td>
                        <td>
                          {l.currency} {l.amount.toFixed(2)}
                        </td>
                        <td>{l.sourceRow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                {Object.entries(offer.totals)
                  .map(([c, n]) => `${c} ${n.toFixed(2)}`)
                  .join(' · ')}{' '}
                — currencies are not combined.
              </p>
              {!!offer.missingServices.length && (
                <p>⚠ Missing services: {offer.missingServices.join(', ')}</p>
              )}
              {offer.warnings.map((w, i) => (
                <p key={i}>⚠ {w}</p>
              ))}
              <WinButton
                disabled={disabled || stale || !result.valid || !offer.complete}
                onClick={() =>
                  void act(async () => {
                    await applyTariff(id, source!.runId, offer.id, revision)
                    onApplied()
                  })
                }
              >
                Use tariff costs in quotation
              </WinButton>
            </Box>
          ))}
          <h4 id="agent-rfq-drafts">Agent RFQ drafts</h4>
          {result.decision === 'needs_details' && (
            <p>
              Review the shipment summary above to continue.{' '}
              <WinButton disabled={disabled} onClick={onReview}>
                Review shipment
              </WinButton>
            </p>
          )}
          {result.decision === 'tariff_available' && (
            <p>The confirmed scope has tariff coverage. No agent inquiry is needed.</p>
          )}
          {result.decision === 'no_agent' && (
            <Notice>
              <strong>Shipment reviewed — a matching agent is still needed</strong>
              <p>
                {!result.agentDiagnostics
                  ? 'No active agent matched this shipment.'
                  : result.agentDiagnostics.totalActive === 0
                    ? 'There are no agents in the active catalog. Import and activate an agent list.'
                    : result.agentDiagnostics.countryMatches === 0
                      ? 'No active agent covers the origin country.'
                      : result.agentDiagnostics.modeMatches === 0
                        ? 'Agents cover the origin country, but none match this transport mode.'
                        : result.agentDiagnostics.directionMatches === 0
                          ? 'No agent matches the selected import/export direction.'
                          : 'No agent matches the requested services.'}
              </p>
              <WinButton disabled={disabled} onClick={() => navigate('/employee/freight-catalog')}>
                {admin ? 'Manage agent catalog' : 'View agent catalog'}
              </WinButton>
              {!admin && (
                <p>
                  An administrator can import or activate agents. Your shipment review is saved.
                </p>
              )}
            </Notice>
          )}
          {!!result.rfqs.length && <p>Choose a draft below to review. Nothing has been sent.</p>}
          {result.rfqs.map((draft) => (
            <Box key={draft.id} style={{ marginBottom: 10 }}>
              <strong>
                {draft.agent.company} · {draft.agent.email}
              </strong>
              <p>
                {draft.agent.services.join(', ')}
                {draft.agent.preferred ? ' · Preferred agent' : ''}
              </p>
              {editing?.id === draft.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void act(() => saveRfq(id, source!.runId, editing))
                  }}
                >
                  <Label>
                    Subject
                    <Input
                      value={editing.subject}
                      required
                      maxLength={255}
                      onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                    />
                  </Label>
                  <Label>
                    RFQ body
                    <TextArea
                      rows={15}
                      required
                      maxLength={30000}
                      value={editing.body}
                      onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                    />
                  </Label>
                  <Toolbar>
                    <WinButton type="submit" disabled={busy}>
                      Save RFQ draft
                    </WinButton>
                    <WinButton
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        editingRef.current = false
                        setEditing(null)
                        void refresh()
                      }}
                    >
                      Cancel
                    </WinButton>
                  </Toolbar>
                </form>
              ) : (
                <>
                  <details>
                    <summary>Preview: {draft.subject}</summary>
                    <Pre>{draft.body}</Pre>
                  </details>
                  <Toolbar>
                    <WinButton
                      disabled={disabled || stale}
                      onClick={() => {
                        editingRef.current = true
                        sequence.current++
                        setEditing({ ...draft })
                      }}
                    >
                      Edit draft
                    </WinButton>
                    <WinButton
                      disabled={
                        disabled || stale || !!(result.rfqBlockers ?? result.blockers).length
                      }
                      onClick={() => eml(draft)}
                    >
                      Download Outlook draft (.eml)
                    </WinButton>
                  </Toolbar>
                </>
              )}
            </Box>
          ))}
        </>
      )}
      {!!history.length && (
        <details>
          <summary>Previous sourcing runs ({history.length})</summary>
          {[...history].reverse().map((run) => (
            <details key={run.runId}>
              <summary>
                {dateText(run.startedAt)} · {run.result?.decision || run.status}
              </summary>
              {run.result?.rfqs.map((d) => (
                <div key={d.id}>
                  <strong>
                    {d.agent.email} · {d.subject}
                  </strong>
                  <Pre>{d.body}</Pre>
                </div>
              ))}
            </details>
          ))}
        </details>
      )}
    </Box>
  )
}
