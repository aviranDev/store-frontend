import { useEffect, useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import type { Dashboard } from '../../Services/quotation'

export const stages = [
  ['received', 'Received'],
  ['parsing', 'Parsing'],
  ['details_review', 'Details Review'],
  ['preparing', 'Preparing Quotation'],
  ['ready', 'Ready for Approval'],
  ['sent', 'Sent'],
  ['closed', 'Closed']
]
export const stageLabel = (value: string) => stages.find(([key]) => key === value)?.[1] || value
export const stateLabel = (state: string) =>
  ({
    active: 'Active',
    waiting: 'Waiting for customer',
    error: 'Processing error',
    rejected: 'Rejected',
    closed: 'Closed'
  })[state] || state
export const dateText = (value?: string) => (value ? new Date(value).toLocaleString() : '—')
export function duration(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60000))
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  return hours < 24 ? `${hours}h ${mins % 60}m` : `${Math.floor(hours / 24)}d ${hours % 24}h`
}
export function useClock() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}
export function errorText(err: unknown): string {
  return axios.isAxiosError(err)
    ? err.response?.data?.message || 'Could not reach the server.'
    : err instanceof Error
      ? err.message
      : 'Operation failed.'
}
export const Surface = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
`
export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`
export const Box = styled.section`
  border: 2px groove #fff;
  background: ${({ theme }) => theme.colors.face};
  padding: 12px;
  min-width: 0;
`
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
`
export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
  min-width: 0;
`
export const Input = styled.input`
  padding: 7px;
  width: 100%;
  box-sizing: border-box;
  border: 2px inset #ddd;
  font: inherit;
  min-width: 0;
`
export const Select = styled.select`
  padding: 7px;
  width: 100%;
  box-sizing: border-box;
  border: 2px inset #ddd;
  font: inherit;
  min-width: 0;
`
export const TextArea = styled.textarea`
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  border: 2px inset #ddd;
  font: inherit;
  resize: vertical;
  min-height: 110px;
`
export const Pre = styled.pre`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  line-height: 1.55;
  margin: 8px 0;
  max-height: 380px;
  overflow: auto;
`
export const Notice = styled.div`
  border: 1px solid #a18b52;
  background: #fff9df;
  padding: 10px;
  font-size: 13px;
  line-height: 1.5;
`
export const Badge = styled.span`
  display: inline-block;
  border: 1px solid #777;
  background: #fff;
  padding: 3px 6px;
  font-size: 12px;
  margin: 2px;
`
export function StatusBadge({ state }: { state: string }) {
  const icon =
    state === 'waiting'
      ? '◷'
      : state === 'error'
        ? '⚠'
        : state === 'rejected'
          ? '✕'
          : state === 'closed'
            ? '✓'
            : '●'
  return (
    <Badge>
      {icon} {stateLabel(state)}
    </Badge>
  )
}
export function Progress({ dashboard: d, parsed }: { dashboard: Dashboard; parsed: boolean }) {
  const completed: Record<string, boolean> = {
    received: true,
    parsing: parsed,
    details_review: Boolean(d.verifiedAt),
    preparing: Boolean(d.pricingApprovedAt),
    ready: d.drafts.some((x) => x.kind === 'quotation' && x.status === 'sent'),
    sent: d.drafts.some((x) => x.kind === 'quotation' && x.status === 'sent'),
    closed: d.state === 'closed'
  }
  return (
    <Toolbar aria-label="Quotation progress">
      {stages.map(([key, label]) => (
        <Badge key={key} aria-current={d.stage === key ? 'step' : undefined}>
          {d.stage === key && d.state === 'rejected'
            ? '✕'
            : d.stage === key && d.state === 'error'
              ? '⚠'
              : d.stage === key && d.state === 'waiting'
                ? '◷'
                : completed[key]
                  ? '✓'
                  : d.stage === key
                    ? '●'
                    : '○'}{' '}
          {label}
        </Badge>
      ))}
    </Toolbar>
  )
}
export const detailGroups: { title: string; fields: [string, string, string[]?][] }[] = [
  {
    title: 'Parties and route',
    fields: [
      ['companyName', 'Customer company'],
      ['customerName', 'Customer contact'],
      ['shipper', 'Shipper'],
      ['consignee', 'Consignee'],
      [
        'shipmentMode',
        'Transport mode',
        ['unknown', 'ocean', 'air', 'courier', 'truck', 'multimodal']
      ],
      [
        'shipmentType',
        'Shipment type',
        ['unknown', 'FCL', 'LCL', 'air_freight', 'courier', 'multiple_segments']
      ],
      [
        'incoterm',
        'Incoterm',
        ['unknown', 'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
      ],
      ['incotermPlace', 'Incoterm named place / port'],
      ['origin', 'Origin'],
      ['destination', 'Destination'],
      ['pol', 'Origin port'],
      ['pod', 'Destination port'],
      ['pickupAddress', 'Pickup address'],
      ['deliveryAddress', 'Delivery address']
    ]
  },
  {
    title: 'Sourcing scope',
    fields: [
      ['originCountryCode', 'Origin country (two-letter code, e.g. CN)'],
      [
        'tradeDirection',
        'Direction relative to your company',
        ['unknown', 'import', 'export', 'cross_trade']
      ],
      [
        'requiredServices',
        'Service codes (comma separated): pickup, origin_handling, export_clearance, main_carriage, destination_handling, import_clearance, delivery, insurance, duties, other'
      ],
      ['serviceScopeConfirmed', 'I confirmed all requested services', ['no', 'yes']],
      ['chargeableWeightKg', 'Confirmed chargeable weight for air tariffs (kg)']
    ]
  },
  {
    title: 'Cargo and requirements',
    fields: [
      ['commodity', 'Cargo description'],
      ['packageType', 'Package type'],
      ['packageCount', 'Package count'],
      ['dimensions', 'Dimensions (include units and quantity per size)'],
      ['grossWeightKg', 'Gross weight (kg)'],
      ['cbm', 'Volume (m³)'],
      ['containerType', 'Container type'],
      ['containerCount', 'Container count'],
      ['stackable', 'Stackable', ['unknown', 'yes', 'no']],
      ['dangerousGoods', 'Dangerous goods', ['unknown', 'yes', 'no']],
      ['readyDate', 'Cargo ready date'],
      ['shippingDate', 'Requested shipping date'],
      ['services', 'Requested services'],
      ['specialInstructions', 'Special instructions']
    ]
  }
]
export const numericFields = [
  'packageCount',
  'grossWeightKg',
  'cbm',
  'containerCount',
  'chargeableWeightKg'
]
export const fieldLabel = (key: string) =>
  detailGroups.flatMap((g) => g.fields).find(([k]) => k === key)?.[1] || key
