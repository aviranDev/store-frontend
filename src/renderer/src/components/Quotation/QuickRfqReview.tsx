import { useEffect, useState } from 'react'
import type { Quotation } from '../../Services/quotation'
import WinButton from '../Button/WinButton'
import ServicePicker, { serviceLabel, isService } from './ServicePicker'
import { Badge, Box, Grid, Notice, Toolbar } from './common'

export default function QuickRfqReview({
  request,
  locked,
  busy,
  onConfirm,
  onEdit,
  onSource,
  onScopeEditing
}: {
  request: Quotation
  locked: boolean
  busy: boolean
  onConfirm: (services: string[]) => void
  onEdit: () => void
  onSource: () => void
  onScopeEditing: (editing: boolean) => void
}) {
  const d = request.dashboard,
    preview = request.rfqReview
  const [services, setServices] = useState(preview?.services || [])
  const [changing, setChanging] = useState(false)
  useEffect(() => {
    setServices(request.rfqReview?.services || [])
    setChanging(false)
  }, [request.dashboard.revision, request.rfqReview])
  const value = (key: string) => String(d.details[key] ?? '').trim() || 'Not provided'
  const cargo = `${value('packageCount')} ${value('packageType') === 'Not provided' ? 'packages' : value('packageType')}`
  const serviceName = (key: string) =>
    key === 'main_carriage' && d.details.shipmentMode === 'air' ? 'Air freight' : serviceLabel(key)
  const invalidScope = !services.length || services.some((s) => !isService(s))
  const confirmed = Boolean(d.rfqReviewedAt || d.verifiedAt) && !changing
  const summary = services.map(serviceName).join(' + ')
  const handling = (key: string, positive: string, negative: string) => {
    const text =
      d.details[key] === 'yes' ? positive : d.details[key] === 'no' ? negative : 'Needs review'
    return `${text}${d.assumedFields?.includes(key) ? ' (assumed)' : ''}`
  }
  return (
    <Box id="quick-rfq-review" aria-label="Review shipment and prepare an agent inquiry">
      <Toolbar>
        <h3 style={{ margin: '0 auto 0 0' }}>
          {confirmed
            ? '✓ Shipment reviewed for agent inquiry'
            : 'Review shipment & prepare agent inquiry'}
        </h3>
        <Badge>
          {value('incoterm')} · {value('shipmentMode')}
        </Badge>
      </Toolbar>
      <p style={{ fontSize: 18, margin: '14px 0' }}>
        <strong>
          {value('origin')} → {value('destination')}
        </strong>
      </p>
      <Grid>
        <div>
          <strong>Cargo</strong>
          <p>
            {cargo} · {value('grossWeightKg')} kg
            <br />
            {value('dimensions')}
          </p>
        </div>
        <div>
          <strong>Pickup</strong>
          <p style={{ whiteSpace: 'pre-wrap' }}>{value('pickupAddress')}</p>
        </div>
        <div>
          <strong>Handling</strong>
          <p>
            {handling('stackable', 'Stackable', 'Non-stackable')}
            <br />
            {handling('dangerousGoods', 'Dangerous goods declared', 'Non-DG')}
          </p>
        </div>
      </Grid>
      <p>
        <strong>
          {preview?.suggested && !changing ? 'Suggested services' : 'Requested services'}:
        </strong>{' '}
        {summary || 'Choose the services below'}
        {d.details.destination ? ` to ${value('destination')}` : ''}.
      </p>
      {request.analysis?.incotermPlaceSuggested === true && (
        <p>
          <small>
            Proposed EXW named place: {value('incotermPlace')}. Confirm this matches the agreed
            collection point.
          </small>
        </p>
      )}
      {!!preview?.pending.length && (
        <p>
          <small>
            Can be confirmed later: {preview.pending.join(', ')}. The agent inquiry will show these
            as pending.
          </small>
        </p>
      )}
      {(changing || !services.length) && (
        <ServicePicker
          selected={services}
          mode={d.details.shipmentMode}
          disabled={locked}
          onChange={(s) => {
            setServices(s)
            setChanging(true)
            onScopeEditing(true)
          }}
        />
      )}
      {!!preview?.blockers.length && (
        <Notice>
          <strong>Before continuing</strong>
          <ul>
            {preview.blockers.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
          <WinButton disabled={locked} onClick={onEdit}>
            Correct shipment details
          </WinButton>
        </Notice>
      )}
      {!preview && <Notice>Refresh after updating the backend to use this review action.</Notice>}
      {invalidScope && !locked && (
        <p role="status">Choose at least one service to include in the inquiry.</p>
      )}
      <Toolbar style={{ marginTop: 14 }}>
        {confirmed ? (
          <WinButton
            onClick={() =>
              document.getElementById('agent-rfq-drafts')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            View agent drafts
          </WinButton>
        ) : (
          <WinButton
            disabled={locked || !preview || !!preview.blockers.length || invalidScope}
            onClick={() => onConfirm(services)}
          >
            {busy ? 'Preparing…' : '✓ Confirm & prepare agent RFQ'}
          </WinButton>
        )}
        <WinButton disabled={locked} onClick={onEdit}>
          Edit shipment
        </WinButton>
        <WinButton
          disabled={locked}
          onClick={() => {
            if (changing) {
              setServices(preview?.services || [])
              setChanging(false)
              onScopeEditing(false)
            } else {
              setChanging(true)
              onScopeEditing(true)
            }
          }}
        >
          {changing ? 'Cancel service changes' : 'Change services'}
        </WinButton>
        <WinButton disabled={locked} onClick={onSource}>
          View original email
        </WinButton>
      </Toolbar>
      <p style={{ marginBottom: 0 }}>
        <small>
          Confirming approves the displayed details, assumptions and services for a preliminary rate
          inquiry. The app prepares drafts for matching agents; you review them before sending.
        </small>
      </p>
    </Box>
  )
}
