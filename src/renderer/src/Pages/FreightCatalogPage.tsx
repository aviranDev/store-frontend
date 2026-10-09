import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import WinButton from '../components/Button/WinButton'
import { useLogin } from '../Store/LoginProvider'
import {
  Badge,
  Box,
  Grid,
  Input,
  Label,
  Notice,
  Select,
  Surface,
  Toolbar,
  dateText,
  errorText
} from '../components/Quotation/common'
import {
  activateCatalog,
  aiMapping,
  catalogBatch,
  catalogBatches,
  catalogEntries,
  downloadCatalog,
  importCatalog,
  retryCatalog,
  uploadCatalog,
  type Batch
} from '../Services/freight'
const cellStyle = {
  padding: 8,
  borderBottom: '1px solid #ccc',
  textAlign: 'left' as const,
  verticalAlign: 'top'
}
export default function FreightCatalogPage(): React.JSX.Element {
  const { user } = useLogin()
  const admin = user?.role === 'admin'
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<'agents' | 'tariffs'>('agents')
  const [batches, setBatches] = useState<Batch[]>([])
  const [selected, setSelected] = useState('')
  const [detail, setDetail] = useState<Batch | null>(null)
  const [sheet, setSheet] = useState(0)
  const [headerRow, setHeaderRow] = useState(1)
  const [mapping, setMapping] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [checked, setChecked] = useState(false)
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState<Awaited<ReturnType<typeof catalogEntries>> | null>(null)
  const signature = useRef('')
  const sequence = useRef(0)
  const refresh = useCallback(async () => {
    try {
      if (admin) setBatches(await catalogBatches())
      setRecords(await catalogEntries(kind, page))
    } catch (e) {
      setError(errorText(e))
    }
  }, [admin, kind, page])
  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), 4000)
    return () => window.clearInterval(timer)
  }, [refresh])
  const loadDetail = useCallback(async () => {
    if (!selected || !admin) return
    const seq = ++sequence.current
    try {
      const result = await catalogBatch(selected, sheet, headerRow)
      if (seq !== sequence.current) return
      setDetail(result)
      const key = `${selected}:${sheet}:${headerRow}:${result.headers?.join('|')}`
      if (signature.current !== key) {
        setMapping(
          result.sheet === sheet && result.headerRow === headerRow
            ? result.mapping || result.suggestion || {}
            : result.suggestion || {}
        )
        setChecked(false)
        signature.current = key
      }
    } catch (e) {
      if (seq === sequence.current) setError(errorText(e))
    }
  }, [selected, sheet, headerRow, admin])
  useEffect(() => {
    void loadDetail()
    const timer = window.setInterval(() => void loadDetail(), 2500)
    return () => {
      window.clearInterval(timer)
      sequence.current++
    }
  }, [loadDetail])
  async function upload(files: File[]) {
    if (!admin || busy || !files.length) return
    if (files.length > 5) {
      setError('Choose up to five files at a time.')
      return
    }
    setBusy(true)
    setError('')
    try {
      for (const file of files) {
        if (!/\.(xlsx|xls|csv)$/i.test(file.name) || file.size > 5 * 1024 * 1024)
          throw new Error('Each file must be XLSX/XLS/CSV and no larger than 5 MB.')
        setMessage(`Uploading ${file.name}`)
        setProgress(0)
        const result = await uploadCatalog(file, kind, setProgress)
        setSelected(result._id)
        setSheet(0)
        setHeaderRow(1)
      }
      setMessage('Files saved. Review the selected sheet and mapping below.')
      await refresh()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  async function pick() {
    try {
      if (window.api?.freightFiles) {
        const files = await window.api.freightFiles.pick()
        await upload(files.map((f) => new File([new Uint8Array(f.bytes).buffer], f.name)))
      } else input.current?.click()
    } catch (e) {
      setError(errorText(e))
    }
  }
  async function action(task: () => Promise<unknown>) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await task()
      await refresh()
      await loadDetail()
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  const cols =
    kind === 'agents'
      ? ['company', 'email', 'countries', 'modes', 'directions', 'services', 'preferred']
      : [
          'tariff',
          'supplier',
          'origin',
          'destination',
          'shipmentType',
          'containerType',
          'incoterm',
          'charge',
          'rate',
          'currency',
          'unit',
          'validTo'
        ]
  return (
    <DashboardShell title="Agents & Tariffs" activePanel={admin ? 'admin' : 'employee'}>
      <Surface>
        <Toolbar>
          <h2 style={{ margin: '0 auto 0 0' }}>Agents & Tariffs</h2>
          <WinButton onClick={() => navigate('/employee/quotations')}>Quotation requests</WinButton>
          <WinButton onClick={() => navigate(admin ? '/admin' : '/employee')}>Back</WinButton>
        </Toolbar>
        <Toolbar>
          <WinButton
            aria-pressed={kind === 'agents'}
            onClick={() => {
              setKind('agents')
              setPage(1)
            }}
          >
            Agent master
          </WinButton>
          <WinButton
            aria-pressed={kind === 'tariffs'}
            onClick={() => {
              setKind('tariffs')
              setPage(1)
            }}
          >
            Tariffs & consolidations
          </WinButton>
          <Badge>{records?.total || 0} active records</Badge>
        </Toolbar>
        {error && <Notice role="alert">{error}</Notice>}
        {message && <Notice role="status">{message}</Notice>}
        {admin && (
          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void upload(Array.from(e.dataTransfer.files))
            }}
          >
            <h3>Upload {kind === 'agents' ? 'agent master' : 'tariffs'}</h3>
            <p>
              Drop Excel / CSV files here, or use the system file picker. Up to 5 files; 5 MB each.
            </p>
            <WinButton disabled={busy} onClick={() => void pick()}>
              Choose files…
            </WinButton>
            <input
              ref={input}
              hidden
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                void upload(Array.from(e.target.files || []))
                e.target.value = ''
              }}
            />
            {busy && (
              <p>
                <progress aria-label="File upload" max={100} value={progress} />
              </p>
            )}
            <p>
              <small>
                Imports are shared with employees. Review mappings before activation. Re-uploading
                the same file does not duplicate it.
              </small>
            </p>
          </Box>
        )}
        {admin && (
          <Box>
            <h3>Import history & versions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['File', 'Type / status', 'Records', 'Active', 'Actions'].map((x) => (
                      <th style={cellStyle} key={x}>
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b._id}>
                      <td style={cellStyle}>
                        <button
                          onClick={() => {
                            setSelected(b._id)
                            setSheet(b.sheet || 0)
                            setHeaderRow(b.headerRow || 1)
                            setError('')
                          }}
                        >
                          {b.filename}
                        </button>
                        <br />
                        <small>{dateText(b.createdAt)}</small>
                      </td>
                      <td style={cellStyle}>
                        {b.kind} · {b.status}
                        {b.error && <div>⚠ {b.error}</div>}
                      </td>
                      <td style={cellStyle}>{b.count}</td>
                      <td style={cellStyle}>{b.active ? '✓ Active' : 'Inactive'}</td>
                      <td style={cellStyle}>
                        <Toolbar>
                          <WinButton
                            disabled={busy}
                            onClick={() =>
                              void downloadCatalog(b._id, b.filename).catch((e) =>
                                setError(errorText(e))
                              )
                            }
                          >
                            Original file
                          </WinButton>
                          {b.status === 'ready' && (
                            <WinButton
                              disabled={busy}
                              onClick={() =>
                                void action(() => activateCatalog(b._id, b.revision, !b.active))
                              }
                            >
                              {b.active ? 'Deactivate' : 'Activate'}
                            </WinButton>
                          )}
                          {b.status === 'error' && (
                            <WinButton
                              disabled={busy}
                              onClick={() => void action(() => retryCatalog(b._id, b.revision))}
                            >
                              Retry
                            </WinButton>
                          )}
                        </Toolbar>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              <small>
                New files create new versions. Deactivate superseded versions after checking the
                replacement. Catalog changes invalidate old sourcing verdicts.
              </small>
            </p>
          </Box>
        )}
        {admin && detail && (
          <Box>
            <Toolbar>
              <h3>{detail.filename}</h3>
              <Badge>{detail.status}</Badge>
              <WinButton
                onClick={() => {
                  setSelected('')
                  setDetail(null)
                }}
              >
                Close import
              </WinButton>
            </Toolbar>
            {['parsing', 'importing'].includes(detail.status) ? (
              <>
                <progress aria-label="Processing import" />
                <p>
                  {detail.status === 'parsing'
                    ? 'Reading workbook in the background…'
                    : 'Saving validated records…'}
                </p>
              </>
            ) : (
              <>
                <Grid>
                  <Label>
                    Sheet
                    <Select
                      value={sheet}
                      disabled={detail.status === 'ready' || busy}
                      onChange={(e) => setSheet(Number(e.target.value))}
                    >
                      {detail.sheets?.map((s, i) => (
                        <option key={i} value={i}>
                          {s.name} ({s.rows} rows)
                        </option>
                      ))}
                    </Select>
                  </Label>
                  <Label>
                    Header row (1–20)
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      disabled={detail.status === 'ready' || busy}
                      value={headerRow}
                      onChange={(e) =>
                        setHeaderRow(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                      }
                    />
                  </Label>
                </Grid>
                {detail.status !== 'ready' && (
                  <>
                    <p>
                      Map each database field to its Excel column. Unmapped optional fields stay
                      empty. Required fields are validated at import.
                    </p>
                    <WinButton
                      disabled={busy || !detail.headers?.length}
                      onClick={() =>
                        void action(async () => {
                          setMapping(await aiMapping(detail._id, sheet, headerRow))
                          setChecked(false)
                          setMessage('AI mapping suggested. Review every field before importing.')
                        })
                      }
                    >
                      Suggest mapping with Ollama
                    </WinButton>
                    <Grid style={{ marginTop: 12 }}>
                      {detail.fields?.map((field) => (
                        <Label key={field}>
                          {field}
                          <Select
                            value={mapping[field] ?? ''}
                            onChange={(e) => {
                              setChecked(false)
                              setMapping((old) => {
                                const next = { ...old }
                                if (e.target.value === '') delete next[field]
                                else next[field] = Number(e.target.value)
                                return next
                              })
                            }}
                          >
                            <option value="">Not mapped</option>
                            {detail.headers?.map((header, i) => (
                              <option key={i} value={i}>
                                {i + 1}: {header || '(blank)'}
                              </option>
                            ))}
                          </Select>
                        </Label>
                      ))}
                    </Grid>
                    <details>
                      <summary>Preview first five data rows</summary>
                      <div style={{ overflowX: 'auto' }}>
                        <table>
                          <thead>
                            <tr>
                              {detail.headers?.map((h, i) => (
                                <th style={cellStyle} key={i}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {detail.sample?.map((row, i) => (
                              <tr key={i}>
                                {row.map((v, j) => (
                                  <td key={j} style={cellStyle}>
                                    {String(v ?? '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                    <p>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setChecked(e.target.checked)}
                        />{' '}
                        I checked the mapping, currencies, units and dates against the source.
                      </label>
                    </p>
                    <WinButton
                      disabled={busy || !checked || !detail.headers?.length}
                      onClick={() =>
                        void action(async () => {
                          const result = await importCatalog(detail._id, {
                            revision: detail.revision,
                            sheet,
                            headerRow,
                            mapping
                          })
                          setMessage(
                            result.accepted
                              ? 'Import started. Validated records will activate together.'
                              : 'Correct the row errors or mapping; no records were activated.'
                          )
                        })
                      }
                    >
                      Validate & import to database
                    </WinButton>
                  </>
                )}
                {!!detail.errors.length && (
                  <Notice>
                    <strong>Rows requiring correction</strong>
                    <ul>
                      {detail.errors.map((e, i) => (
                        <li key={i}>
                          Row {e.row}: {e.message}
                        </li>
                      ))}
                    </ul>
                  </Notice>
                )}
              </>
            )}
            <details>
              <summary>Import activity</summary>
              {detail.events.map((e, i) => (
                <p key={i}>
                  {dateText(e.at)} · {e.note}
                </p>
              ))}
            </details>
          </Box>
        )}
        <Box>
          <h3>Active {kind === 'agents' ? 'agents' : 'tariff charges'}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {cols.map((c) => (
                    <th key={c} style={cellStyle}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records?.items.map((r) => (
                  <tr key={r._id}>
                    {cols.map((c) => (
                      <td key={c} style={cellStyle}>
                        {Array.isArray(r.value[c])
                          ? (r.value[c] as unknown[]).join(', ')
                          : String(r.value[c] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Toolbar>
            <WinButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </WinButton>
            <span>Page {page}</span>
            <WinButton
              disabled={page * 50 >= (records?.total || 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </WinButton>
          </Toolbar>
        </Box>
      </Surface>
    </DashboardShell>
  )
}
