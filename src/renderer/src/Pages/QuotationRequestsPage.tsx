import { SourcingBadge } from '../components/Quotation/SourcingPanel'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import WinButton from '../components/Button/WinButton'
import { useLogin } from '../Store/LoginProvider'
import {
  getQuotationEmployees,
  listQuotations,
  type Employee,
  type QuotationList
} from '../Services/quotation'
import {
  Surface,
  Toolbar,
  Box,
  Label,
  Input,
  Select,
  Badge,
  Notice,
  StatusBadge,
  stages,
  stageLabel,
  dateText,
  duration,
  useClock,
  errorText
} from '../components/Quotation/common'

const Filters = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
  align-items: end;
`
const Scroll = styled.div`
  overflow: auto;
  border: 2px inset #eee;
  background: white;
`
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th,
  td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    vertical-align: top;
  }
  th {
    background: #e5e5e5;
    white-space: nowrap;
  }
  tbody tr:hover {
    background: #f1f5ff;
  }
  button {
    font: inherit;
    text-align: left;
    cursor: pointer;
    color: #000080;
    background: none;
    border: 0;
    text-decoration: underline;
    padding: 0;
  }
  small {
    display: block;
    margin-top: 5px;
    color: #555;
  }
`
type FiltersState = {
  q: string
  stage: string
  state: string
  assignedTo: string
  fromDate: string
  toDate: string
  overdue: boolean
}
const initial: FiltersState = {
  q: '',
  stage: '',
  state: '',
  assignedTo: '',
  fromDate: '',
  toDate: '',
  overdue: false
}
export default function QuotationRequestsPage(): React.JSX.Element {
  const { user } = useLogin()
  const admin = user?.role === 'admin'
  const navigate = useNavigate()
  const now = useClock()
  const [data, setData] = useState<QuotationList | null>(null)
  const [filters, setFilters] = useState(initial)
  const [applied, setApplied] = useState(initial)
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const sequence = useRef(0)
  const refresh = useCallback(async () => {
    const seq = ++sequence.current
    const params: Record<string, string | number | boolean> = { page }
    Object.entries(applied).forEach(([key, value]) => {
      if (value !== '' && value !== false) params[key] = value
    })
    try {
      const result = await listQuotations(params)
      if (seq === sequence.current) {
        setData(result)
        setError('')
      }
    } catch (err) {
      if (seq === sequence.current) setError(errorText(err))
    } finally {
      if (seq === sequence.current) setLoading(false)
    }
  }, [applied, page])
  useEffect(() => {
    void refresh()
    const t = window.setInterval(() => void refresh(), 10000)
    return () => {
      window.clearInterval(t)
      sequence.current++
    }
  }, [refresh])
  useEffect(() => {
    if (admin)
      getQuotationEmployees()
        .then(setEmployees)
        .catch((err) => setError(errorText(err)))
  }, [admin])
  const change = (key: keyof FiltersState, value: string | boolean) =>
    setFilters((prev) => ({ ...prev, [key]: value }))
  return (
    <DashboardShell
      title={admin ? 'All Quotation Requests' : 'My Quotation Requests'}
      activePanel={admin ? 'admin' : 'employee'}
    >
      <Surface>
        <Toolbar>
          <h2 style={{ margin: '0 auto 0 0' }}>
            {admin ? 'All Quotation Requests' : 'My Quotation Requests'}
          </h2>
          <WinButton onClick={() => navigate('/employee/freight-catalog')}>
            Agents & Tariffs
          </WinButton>
          <WinButton onClick={() => void refresh()}>Refresh</WinButton>
          <WinButton onClick={() => navigate('/account')}>Account</WinButton>
          <WinButton onClick={() => navigate(admin ? '/admin' : '/employee')}>Back</WinButton>
        </Toolbar>
        <Toolbar>
          <Badge>AI replies: draft for approval</Badge>
          <span>{data?.total ?? 0} requests</span>
        </Toolbar>
        <Box>
          <Filters
            onSubmit={(e) => {
              e.preventDefault()
              setPage(1)
              setLoading(true)
              setApplied({ ...filters })
            }}
          >
            <Label>
              Search
              <Input
                value={filters.q}
                maxLength={100}
                placeholder="Customer, reference, subject…"
                onChange={(e) => change('q', e.target.value)}
              />
            </Label>
            <Label>
              Stage
              <Select value={filters.stage} onChange={(e) => change('stage', e.target.value)}>
                <option value="">All stages</option>
                {stages.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              Status
              <Select value={filters.state} onChange={(e) => change('state', e.target.value)}>
                <option value="">All statuses</option>
                {['active', 'waiting', 'error', 'rejected', 'closed'].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </Select>
            </Label>
            {admin && (
              <Label>
                Employee
                <Select
                  value={filters.assignedTo}
                  onChange={(e) => change('assignedTo', e.target.value)}
                >
                  <option value="">All employees</option>
                  {employees.map((x) => (
                    <option key={x._id} value={x._id}>
                      {x.username}
                    </option>
                  ))}
                </Select>
              </Label>
            )}
            <Label>
              Received from (UTC)
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => change('fromDate', e.target.value)}
              />
            </Label>
            <Label>
              Received to (UTC)
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => change('toDate', e.target.value)}
              />
            </Label>
            <label>
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(e) => change('overdue', e.target.checked)}
              />{' '}
              Overdue ({data?.overdueHours ?? 24}h)
            </label>
            <WinButton type="submit">Apply filters</WinButton>
            <WinButton
              type="button"
              onClick={() => {
                setFilters(initial)
                setApplied(initial)
                setPage(1)
              }}
            >
              Clear
            </WinButton>
          </Filters>
        </Box>
        {error && <Notice role="alert">{error}</Notice>}
        {loading && <p role="status">Loading requests…</p>}
        {!loading && data?.items.length === 0 && (
          <Box>
            No matching quotation requests. Connect Outlook and enable the quotation watcher to
            receive requests.
          </Box>
        )}
        {!!data?.items.length && (
          <Scroll>
            <Table>
              <thead>
                <tr>
                  <th>Request / customer</th>
                  <th>Route / shipment</th>
                  <th>Assigned / mailbox</th>
                  <th>Progress</th>
                  <th>Elapsed</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => {
                  const end = row.terminalAt ? Date.parse(row.terminalAt) : now
                  const age = Math.max(0, end - Date.parse(row.receivedAt))
                  const overdue = !row.terminalAt && age > data.overdueHours * 3600000
                  return (
                    <tr key={row._id}>
                      <td>
                        <button onClick={() => navigate(`/employee/quotations/${row._id}`)}>
                          {row.poNumber || row.reference || row._id.slice(-8).toUpperCase()} ·{' '}
                          {row.subject}
                        </button>
                        <small>
                          {String(
                            row.details?.companyName ||
                              row.client.companyName ||
                              row.client.name ||
                              row.client.email
                          )}
                        </small>
                        <small>{dateText(row.receivedAt)}</small>
                      </td>
                      <td>
                        {String(row.details?.origin || row.origin || '—')} →{' '}
                        {String(row.details?.destination || row.destination || '—')}
                        <small>
                          {String(row.details?.shipmentType || row.shipmentType || '—')} ·{' '}
                          {String(row.details?.incoterm || row.incoterm || '—')}
                        </small>
                      </td>
                      <td>
                        {row.employee || 'Unassigned'}
                        <small>{row.sourceMailbox || 'Manual request'}</small>
                      </td>
                      <td>
                        {stageLabel(row.stage)}
                        <br />
                        <StatusBadge state={row.state} />
                        <br />
                        <SourcingBadge {...row.sourcing} />
                        {row.missingFields.length > 0 && (
                          <small>⚠ {row.missingFields.length} missing fields</small>
                        )}
                        {!!row.conflicts?.length && <small>⚠ Source conflicts</small>}
                        {row.errorMessage && <small>⚠ {row.errorMessage}</small>}
                      </td>
                      <td>
                        {duration(age)}
                        {overdue && <small>⚠ Overdue</small>}
                        <small>
                          Stage:{' '}
                          {row.enteredAt
                            ? duration(end - Date.parse(row.enteredAt))
                            : 'Tracking begins on review'}
                        </small>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Scroll>
        )}
        <Toolbar>
          <WinButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </WinButton>
          <span>
            Page {page} of {Math.max(1, Math.ceil((data?.total || 0) / 20))}
          </span>
          <WinButton
            disabled={page * 20 >= (data?.total || 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </WinButton>
        </Toolbar>
      </Surface>
    </DashboardShell>
  )
}
