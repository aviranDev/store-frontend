import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import WinButton from '../components/Button/WinButton'
import { useLogin } from '../Store/LoginProvider'
import {
  actOnQuotation,
  downloadQuotationAttachment,
  getQuotation,
  getQuotationAttachments,
  getQuotationEmployees,
  retryQuotation,
  type Attachment,
  type Details,
  type Draft,
  type Employee,
  type Quotation
} from '../Services/quotation'
import {
  Badge,
  Box,
  Grid,
  Input,
  Label,
  Notice,
  Pre,
  Progress,
  Select,
  StatusBadge,
  Surface,
  TextArea,
  Toolbar,
  dateText,
  detailGroups,
  duration,
  errorText,
  fieldLabel,
  numericFields,
  stageLabel,
  useClock
} from '../components/Quotation/common'

type Section = 'details' | 'quotation' | 'emails' | 'history'
type RequestAction = '' | 'wait' | 'reject' | 'close' | 'reopen'

export default function QuotationDetailsPage(): React.JSX.Element {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useLogin()
  const admin = user?.role === 'admin'
  const now = useClock()
  const [request, setRequest] = useState<Quotation | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [editing, setEditing] = useState<string | null>(null)
  const editingRef = useRef<string | null>(null)
  const [section, setSection] = useState<Section>('details')
  const [details, setDetails] = useState<Details>({})
  const [quoteText, setQuoteText] = useState('')
  const [draftText, setDraftText] = useState({ subject: '', body: '' })
  const [reviewed, setReviewed] = useState(false)
  const [pricingReviewed, setPricingReviewed] = useState(false)
  const [action, setAction] = useState<RequestAction>('')
  const [reason, setReason] = useState('')
  const [outcome, setOutcome] = useState('other')
  const [assignee, setAssignee] = useState('')
  const [files, setFiles] = useState<Attachment[] | null>(null)
  const [resolution, setResolution] = useState('sent')
  const [reconcileReason, setReconcileReason] = useState('')
  const sequence = useRef(0)
  const receivedLocallyAt = useRef(Date.now())
  const refresh = useCallback(
    async (force = false) => {
      const seq = ++sequence.current
      try {
        const value = await getQuotation(id)
        if (seq === sequence.current && (force || (!editingRef.current && !busyRef.current))) {
          receivedLocallyAt.current = Date.now()
          setRequest(value)
          setReviewed(false)
          setPricingReviewed(false)
        }
      } catch (err) {
        if (seq === sequence.current) setError(errorText(err))
      }
    },
    [id]
  )
  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      if (!editingRef.current && !busyRef.current) void refresh()
    }, 5000)
    return () => {
      window.clearInterval(timer)
      sequence.current++
    }
  }, [refresh])
  useEffect(() => {
    if (admin)
      getQuotationEmployees()
        .then(setEmployees)
        .catch((err) => setError(errorText(err)))
  }, [admin])
  function edit(value: string | null) {
    editingRef.current = value
    setEditing(value)
    sequence.current++
  }
  async function perform(payload: Record<string, unknown>, isRetry = false) {
    if (!request || busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (isRetry) await retryQuotation(id, request.dashboard.revision)
      else await actOnQuotation(id, { ...payload, revision: request.dashboard.revision })
      edit(null)
      setAction('')
      setReason('')
      setReconcileReason('')
      setNotice(
        payload.action === 'send'
          ? 'Outlook accepted the email for sending. Delivery is not confirmed.'
          : isRetry
            ? 'Parsing queued. Progress will refresh automatically.'
            : 'Saved.'
      )
      await refresh(true)
    } catch (err) {
      setError(errorText(err))
      if (!editingRef.current) await refresh(true)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  async function attachments() {
    setError('')
    try {
      setFiles(await getQuotationAttachments(id))
    } catch (err) {
      setError(errorText(err))
    }
  }
  function beginAction(value: RequestAction) {
    setAction(value)
    setReason('')
    setOutcome('other')
    edit(value ? 'action' : null)
  }
  function send(draft: Draft) {
    if (
      window.confirm(
        `Approve and send this ${draft.kind} email?\n\nFrom: ${request?.connection?.accountEmail || request?.sourceMailbox}\nTo: ${draft.to}\nSubject: ${draft.subject}\n\nThe body shown below will be sent.`
      )
    )
      void perform({ action: 'send', draftId: draft.id })
  }
  const shell = (children: React.ReactNode) => (
    <DashboardShell title="Quotation Request" activePanel={admin ? 'admin' : 'employee'}>
      <Surface>{children}</Surface>
    </DashboardShell>
  )
  if (!request)
    return shell(
      <>
        <Toolbar>
          <WinButton onClick={() => navigate('/employee/quotations')}>Back to requests</WinButton>
          <WinButton onClick={() => void refresh()}>Retry loading</WinButton>
        </Toolbar>
        {error ? <Notice role="alert">{error}</Notice> : <p role="status">Loading request…</p>}
      </>
    )
  const d = request.dashboard
  const pendingSend = d.drafts.some((x) => x.status === 'sending' || x.status === 'unknown')
  const locked = busy || Boolean(d.processing) || pendingSend
  const terminal = Boolean(d.terminalAt)
  const blocked = locked || terminal || Boolean(editing)
  const live = terminal ? 0 : Math.max(0, now - receivedLocallyAt.current)
  const age = request.timers.totalMs + live,
    stageTime = request.timers.stageMs + live
  const active = request.timers.activeMs + (d.state === 'active' ? live : 0)
  const waiting = request.timers.waitingMs + (d.state === 'waiting' ? live : 0)
  const actorLabel = (actor: string) =>
    actor === user?.data._id
      ? 'You'
      : employees.find((x) => x._id === actor)?.username ||
        (actor === 'system' || actor === 'ai'
          ? actor
          : actor === request.assignedEmployee?._id
            ? request.assignedEmployee.username
            : actor)
  const parsed = !d.processing && d.events.some((x) => x.action === 'parsing_completed')
  const visibleDrafts = [...d.drafts].reverse()
  return shell(
    <>
      <Toolbar>
        <WinButton disabled={Boolean(editing)} onClick={() => navigate('/employee/quotations')}>
          ← Requests
        </WinButton>
        <h2 style={{ margin: '0 auto 0 0' }}>
          {request.poNumber || request.reference || request._id.slice(-8).toUpperCase()}
        </h2>
        <WinButton
          disabled={busy || Boolean(editing)}
          onClick={() => {
            setError('')
            void refresh()
          }}
        >
          Refresh
        </WinButton>
      </Toolbar>
      <Box>
        <h3 style={{ marginTop: 0 }}>{request.receivedEmail.subject}</h3>
        <Toolbar>
          <Badge>{stageLabel(d.stage)}</Badge>
          <StatusBadge state={d.state} />
          <Badge>Email mode: draft for approval</Badge>
        </Toolbar>
        <p>
          {request.client.name || request.client.email} · {request.client.email}
          <br />
          Assigned: {request.assignedEmployee?.username || 'Unassigned'} · Mailbox:{' '}
          {request.connection?.accountEmail || request.sourceMailbox || 'Manual request'}
        </p>
        <Grid>
          <span>Received: {dateText(request.receivedEmail.receivedAt)}</span>
          <span>Total age: {duration(age)}</span>
          <span>Current stage: {duration(stageTime)}</span>
          <span>Active processing: {duration(active)}</span>
          <span>Waiting for customer: {duration(waiting)}</span>
        </Grid>
        <p>
          <small>
            Active time measures time in an active workflow state, including employee review. Timing
            history starts {dateText(d.trackingStartedAt)}. Closed/rejected timers stop.
          </small>
        </p>
        <Progress dashboard={d} parsed={parsed} />
        {d.reason && (
          <p>
            <strong>
              {d.state === 'rejected'
                ? 'Employee rejection reason'
                : d.outcome
                  ? `Outcome: ${d.outcome}`
                  : 'Reason'}
              :
            </strong>{' '}
            {d.reason}
          </p>
        )}
      </Box>
      {error && <Notice role="alert">{error}</Notice>}
      {notice && <Notice role="status">{notice}</Notice>}
      {d.processing && (
        <Notice role="status">
          ● Parsing email and supported attachments. Started {dateText(d.processing.startedAt)}.
          Changes are locked until this finishes.
        </Notice>
      )}
      {request.errorMessage && <Notice>⚠ {request.errorMessage}</Notice>}
      {request.missingFields.length > 0 && !terminal && (
        <Notice>
          ⚠ Required information: {request.missingFields.map(fieldLabel).join(', ')}. Confirm
          whether the information is in the original email, or prepare a clarification below.
        </Notice>
      )}
      {d.conflicts.length > 0 && (
        <Notice>
          ⚠ Source information conflicts with employee edits: {d.conflicts.join('; ')}. Review the
          original messages before confirming details.
        </Notice>
      )}
      <Box>
        <Toolbar aria-label="Request actions">
          {!terminal && d.stage !== 'sent' && (
            <WinButton disabled={blocked} onClick={() => beginAction('wait')}>
              ◷ Wait for customer
            </WinButton>
          )}
          {['waiting', 'error'].includes(d.state) && !terminal && (
            <WinButton disabled={blocked} onClick={() => void perform({ action: 'resume' })}>
              Resume review
            </WinButton>
          )}
          {d.state === 'error' && !terminal && (
            <WinButton disabled={blocked} onClick={() => void perform({}, true)}>
              Retry parsing
            </WinButton>
          )}
          {!terminal && d.stage !== 'sent' && (
            <WinButton disabled={blocked} onClick={() => beginAction('reject')}>
              ✕ Reject request
            </WinButton>
          )}
          {!terminal && (
            <WinButton disabled={blocked} onClick={() => beginAction('close')}>
              Close request
            </WinButton>
          )}
          {(terminal || d.stage === 'sent') && (
            <WinButton disabled={locked || Boolean(editing)} onClick={() => beginAction('reopen')}>
              Reopen for revision
            </WinButton>
          )}
        </Toolbar>
        {action && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void perform({ action, reason, ...(action === 'close' ? { outcome } : {}) })
            }}
          >
            <h4>
              {action === 'reject'
                ? 'Reject this request (employee decision)'
                : action === 'close'
                  ? 'Record the request outcome'
                  : action === 'wait'
                    ? 'Wait for customer information'
                    : 'Reopen this request'}
            </h4>
            {action === 'close' && (
              <Label>
                Outcome
                <Select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                  <option value="other">Otherwise closed</option>
                  <option disabled={d.stage !== 'sent'} value="accepted">
                    Customer accepted quotation
                  </option>
                  <option disabled={d.stage !== 'sent'} value="declined">
                    Customer declined quotation
                  </option>
                </Select>
              </Label>
            )}
            <Label>
              Reason (required)
              <TextArea
                required
                minLength={3}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Label>
            <Toolbar>
              <WinButton disabled={busy} type="submit">
                Confirm {action}
              </WinButton>
              <WinButton disabled={busy} type="button" onClick={() => beginAction('')}>
                Cancel
              </WinButton>
            </Toolbar>
            <p>
              <small>This changes the request only. It does not send an email.</small>
            </p>
          </form>
        )}
        {admin && !terminal && (
          <Toolbar style={{ marginTop: 12 }}>
            <Label>
              Reassign request
              <Select
                disabled={locked || Boolean(editing)}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Choose employee</option>
                {employees.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.username}
                  </option>
                ))}
              </Select>
            </Label>
            <WinButton
              disabled={blocked || !assignee || assignee === request.assignedTo}
              onClick={() => void perform({ action: 'assign', assignedTo: assignee })}
            >
              Assign
            </WinButton>
            <small>Transfers handling permission. Replies still use the source mailbox.</small>
          </Toolbar>
        )}
      </Box>
      <Toolbar aria-label="Request sections">
        {(['details', 'quotation', 'emails', 'history'] as Section[]).map((value) => (
          <WinButton
            key={value}
            aria-pressed={section === value}
            disabled={Boolean(editing) && section !== value}
            onClick={() => {
              setSection(value)
              if (!editing) {
                editingRef.current = null
                setReviewed(false)
                setPricingReviewed(false)
              }
            }}
          >
            {value === 'details'
              ? 'Shipment details'
              : value === 'quotation'
                ? 'Quotation & pricing'
                : value === 'emails'
                  ? 'Emails & drafts'
                  : 'Activity history'}
          </WinButton>
        ))}
      </Toolbar>
      {section === 'details' && (
        <>
          <Box>
            <Toolbar>
              <strong>Shipment details</strong>
              {d.verifiedAt ? (
                <Badge>✓ Verified {dateText(d.verifiedAt)}</Badge>
              ) : (
                <Badge>⚠ Not yet verified</Badge>
              )}
              <WinButton
                disabled={blocked || d.stage === 'sent'}
                onClick={() => {
                  setDetails({ ...d.details })
                  edit('details')
                }}
              >
                Edit details
              </WinButton>
            </Toolbar>
            {request.analysis?.summary && (
              <>
                <h4>Extraction summary (AI / rules)</h4>
                <Pre>{String(request.analysis.summary)}</Pre>
              </>
            )}
            <p>
              <small>
                Values are extracted from the source unless marked “Employee edit.” Extraction is
                not verification. Empty fields stay unknown.
              </small>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void perform({ action: 'details', details })
              }}
            >
              {detailGroups.map((group) => (
                <div key={group.title}>
                  <h4>{group.title}</h4>
                  <Grid>
                    {group.fields.map(([key, label, options]) => {
                      const value = editing === 'details' ? details[key] : d.details[key]
                      return (
                        <Label key={key}>
                          {label}
                          {editing === 'details' ? (
                            options ? (
                              <Select
                                value={String(value || 'unknown')}
                                onChange={(e) =>
                                  setDetails((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                              >
                                {options.map((x) => (
                                  <option key={x}>{x}</option>
                                ))}
                              </Select>
                            ) : (
                              <Input
                                type={
                                  numericFields.includes(key)
                                    ? 'number'
                                    : key.endsWith('Date')
                                      ? 'date'
                                      : 'text'
                                }
                                min={0}
                                step={['containerCount', 'packageCount'].includes(key) ? 1 : 'any'}
                                maxLength={4000}
                                value={value ?? ''}
                                onChange={(e) =>
                                  setDetails((prev) => ({
                                    ...prev,
                                    [key]: numericFields.includes(key)
                                      ? e.target.value === ''
                                        ? null
                                        : Number(e.target.value)
                                      : e.target.value
                                  }))
                                }
                              />
                            )
                          ) : (
                            <span>
                              {value == null || value === '' || value === 'unknown'
                                ? 'Unknown'
                                : String(value)}
                            </span>
                          )}
                          <small>
                            {d.editedFields.includes(key)
                              ? 'Employee edit'
                              : value != null && value !== '' && value !== 'unknown'
                                ? 'Extracted · verify against source'
                                : 'Not provided'}
                          </small>
                        </Label>
                      )
                    })}
                  </Grid>
                </div>
              ))}
              {editing === 'details' && (
                <Toolbar style={{ marginTop: 12 }}>
                  <WinButton type="submit" disabled={busy}>
                    Save details
                  </WinButton>
                  <WinButton
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      edit(null)
                      void refresh()
                    }}
                  >
                    Cancel
                  </WinButton>
                </Toolbar>
              )}
            </form>
            {d.stage === 'details_review' && d.state === 'active' && !terminal && (
              <Toolbar style={{ marginTop: 16 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={reviewed}
                    disabled={blocked || request.missingFields.length > 0}
                    onChange={(e) => {
                      setReviewed(e.target.checked)
                      editingRef.current = e.target.checked ? 'review' : null
                    }}
                  />{' '}
                  I reviewed these values against the source and resolved conflicts.
                </label>
                <WinButton
                  disabled={blocked || !reviewed || request.missingFields.length > 0}
                  onClick={() => {
                    editingRef.current = null
                    void perform({ action: 'verify' })
                  }}
                >
                  ✓ Confirm details
                </WinButton>
              </Toolbar>
            )}
          </Box>
          <Box>
            <Toolbar>
              <h3>Original emails & attachments</h3>
              <WinButton onClick={() => void attachments()}>Load attachments</WinButton>
            </Toolbar>
            <p>
              <small>
                Extraction reads the email and the first XLSX/XLS/CSV attachment per message
                (limited rows). Review other attachments manually. PDF, images and OCR are not
                parsed in this phase.
              </small>
            </p>
            {d.messages.map((message, index) => (
              <details key={message.messageId || index} open={index === d.messages.length - 1}>
                <summary>
                  {dateText(message.receivedAt)} · {message.subject} · {message.from}
                </summary>
                <Pre>{message.text || '(No plain-text body)'}</Pre>
                {message.attachment && (
                  <>
                    <h4>Extracted attachment text: {message.attachment.name}</h4>
                    <Pre>{message.attachment.text}</Pre>
                  </>
                )}
              </details>
            ))}
            {files?.length === 0 && <p>No attachments found.</p>}
            {files?.map((file) => (
              <p key={`${file.messageId}:${file.id}`}>
                <WinButton
                  onClick={() =>
                    void downloadQuotationAttachment(id, file).catch((err) =>
                      setError(errorText(err))
                    )
                  }
                >
                  Download {file.name}
                </WinButton>{' '}
                <small>{Math.ceil(file.size / 1024)} KB</small>
              </p>
            ))}
          </Box>
        </>
      )}
      {section === 'quotation' && (
        <Box>
          <h3>Quotation charges and terms</h3>
          <p>
            Enter the rates, currency, quantities, charges, validity and exclusions you have
            verified. Pricing is entered manually in this phase.
          </p>
          {d.pricingApprovedAt ? (
            <Badge>✓ Pricing approved {dateText(d.pricingApprovedAt)}</Badge>
          ) : (
            <Badge>⚠ Pricing not approved</Badge>
          )}
          {editing === 'quotation' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void perform({ action: 'quotation', quotationText: quoteText })
              }}
            >
              <Label>
                Quotation
                <TextArea
                  rows={14}
                  required
                  maxLength={20000}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                />
              </Label>
              <Toolbar>
                <WinButton disabled={busy} type="submit">
                  Save quotation
                </WinButton>
                <WinButton
                  disabled={busy}
                  type="button"
                  onClick={() => {
                    edit(null)
                    void refresh()
                  }}
                >
                  Cancel
                </WinButton>
              </Toolbar>
            </form>
          ) : (
            <>
              <Pre>{d.quotationText || 'No quotation prepared.'}</Pre>
              <WinButton
                disabled={blocked || !d.verifiedAt || !['preparing', 'ready'].includes(d.stage)}
                onClick={() => {
                  setQuoteText(d.quotationText)
                  edit('quotation')
                }}
              >
                Edit quotation
              </WinButton>
            </>
          )}
          {d.stage === 'preparing' && (
            <Toolbar style={{ marginTop: 16 }}>
              <label>
                <input
                  type="checkbox"
                  checked={pricingReviewed}
                  disabled={blocked || !d.quotationText.trim()}
                  onChange={(e) => {
                    setPricingReviewed(e.target.checked)
                    editingRef.current = e.target.checked ? 'pricing' : null
                  }}
                />{' '}
                I checked and approve these prices and terms.
              </label>
              <WinButton
                disabled={blocked || !pricingReviewed || !d.quotationText.trim()}
                onClick={() => {
                  editingRef.current = null
                  void perform({ action: 'ready' })
                }}
              >
                Ready for approval
              </WinButton>
            </Toolbar>
          )}
          {d.stage === 'ready' && (
            <p>Open Emails & drafts to prepare, review, and explicitly send the quotation.</p>
          )}
        </Box>
      )}
      {section === 'emails' && (
        <>
          <Notice>
            Every reply requires your explicit approval. From:{' '}
            {request.connection?.accountEmail || request.sourceMailbox || 'No Outlook connection'} ·
            To: {request.client.email}. Automatic replies are disabled in this phase.
          </Notice>
          <Toolbar>
            {(['acknowledgment', 'clarification', 'quotation'] as const).map((kind) => (
              <WinButton
                key={kind}
                disabled={
                  blocked || d.stage === 'sent' || (kind === 'quotation' && d.stage !== 'ready')
                }
                onClick={() => void perform({ action: 'generate', kind })}
              >
                Prepare {kind}
              </WinButton>
            ))}
          </Toolbar>
          {!visibleDrafts.length && <Box>No email drafts yet.</Box>}
          {visibleDrafts.map((draft) => (
            <Box key={draft.id}>
              <Toolbar>
                <strong>{draft.kind}</strong>
                <Badge>
                  {draft.status === 'sent'
                    ? '✓ Sent'
                    : draft.status === 'unknown'
                      ? '⚠ Outcome uncertain'
                      : draft.status === 'sending'
                        ? '● Sending'
                        : draft.status === 'cancelled'
                          ? '✕ Cancelled'
                          : 'Draft for approval'}
                </Badge>
                <small>{dateText(draft.createdAt)}</small>
              </Toolbar>
              <p>
                To: {draft.to}
                {draft.sentAt && <> · Sent: {dateText(draft.sentAt)}</>}
              </p>
              {draft.error && <Notice>{draft.error}</Notice>}
              {editing === draft.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void perform({ action: 'edit_draft', draftId: draft.id, ...draftText })
                  }}
                >
                  <Label>
                    Subject
                    <Input
                      required
                      maxLength={255}
                      value={draftText.subject}
                      onChange={(e) =>
                        setDraftText((prev) => ({ ...prev, subject: e.target.value }))
                      }
                    />
                  </Label>
                  <Label>
                    Body
                    <TextArea
                      rows={12}
                      required
                      maxLength={30000}
                      value={draftText.body}
                      onChange={(e) => setDraftText((prev) => ({ ...prev, body: e.target.value }))}
                    />
                  </Label>
                  <Toolbar>
                    <WinButton disabled={busy} type="submit">
                      Save draft
                    </WinButton>
                    <WinButton
                      disabled={busy}
                      type="button"
                      onClick={() => {
                        edit(null)
                        void refresh()
                      }}
                    >
                      Cancel
                    </WinButton>
                  </Toolbar>
                </form>
              ) : (
                <>
                  <h4>{draft.subject}</h4>
                  <Pre style={{ maxHeight: 'none' }}>{draft.body}</Pre>
                </>
              )}
              {draft.status === 'draft' && (
                <Toolbar>
                  <WinButton
                    disabled={blocked}
                    onClick={() => {
                      setDraftText({ subject: draft.subject, body: draft.body })
                      edit(draft.id)
                    }}
                  >
                    Edit draft
                  </WinButton>
                  <WinButton
                    disabled={
                      blocked || !request.connection || request.connection.status !== 'connected'
                    }
                    onClick={() => send(draft)}
                  >
                    Approve & send
                  </WinButton>
                  <WinButton
                    disabled={blocked}
                    onClick={() => void perform({ action: 'cancel_draft', draftId: draft.id })}
                  >
                    Cancel draft
                  </WinButton>
                </Toolbar>
              )}
              {draft.status === 'sending' && now - Date.parse(draft.approvedAt || '') > 120000 && (
                <Notice>
                  Sending has not finished. Refresh to check its status. If the server stopped
                  during sending, restart it to recover the saved attempt before reconciliation.
                </Notice>
              )}
              {draft.status === 'unknown' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (
                      window.confirm(
                        'Have you checked Outlook Sent Items and confirmed this outcome?'
                      )
                    )
                      void perform({
                        action: 'reconcile',
                        draftId: draft.id,
                        resolution,
                        reason: reconcileReason
                      })
                  }}
                >
                  <Notice>
                    Check the connected account’s Sent Items before continuing. An uncertain reply
                    is never retried automatically. Only choose “Not sent” if you established that
                    no copy was sent.
                  </Notice>
                  <Label>
                    Confirmed outcome
                    <Select
                      value={resolution}
                      disabled={busy}
                      onChange={(e) => setResolution(e.target.value)}
                    >
                      <option value="sent">Found the sent email</option>
                      <option value="not_sent">Confirmed not sent — unlock draft</option>
                    </Select>
                  </Label>
                  <Label>
                    What did you check?
                    <TextArea
                      required
                      minLength={10}
                      maxLength={1000}
                      value={reconcileReason}
                      disabled={busy}
                      onChange={(e) => setReconcileReason(e.target.value)}
                    />
                  </Label>
                  <WinButton type="submit" disabled={busy}>
                    Record confirmed outcome
                  </WinButton>
                </form>
              )}
            </Box>
          ))}
        </>
      )}
      {section === 'history' && (
        <Box>
          <h3>Activity history</h3>
          <p>
            <small>
              Newest first. Employee rejection and customer decline are recorded as separate
              outcomes.
            </small>
          </p>
          <ol>
            {[...d.events].reverse().map((event, index) => (
              <li key={`${event.at}:${index}`} style={{ marginBottom: 12 }}>
                <strong>
                  {dateText(event.at)} · {actorLabel(event.actor)} ·{' '}
                  {event.action.replaceAll('_', ' ')}
                </strong>
                <div>{event.note}</div>
              </li>
            ))}
          </ol>
          {request.workflowSteps?.length > 0 && (
            <details>
              <summary>Extraction steps</summary>
              {request.workflowSteps.map((step) => (
                <p key={step.key}>
                  {step.status} · {step.label}
                  {step.note ? ` — ${step.note}` : ''}
                </p>
              ))}
            </details>
          )}
        </Box>
      )}
    </>
  )
}
