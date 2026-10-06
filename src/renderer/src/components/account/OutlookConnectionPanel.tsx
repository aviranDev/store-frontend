import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import Win95GroupBox from '../Win95/Win95GroupBox'
import WinButton from '../Button/WinButton'
import {
  checkOutlook, connectOutlook, disconnectOutlook, listOutlookConnections,
  type OutlookConnection
} from '../../Services/outlook'

const Content = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow: auto;
`
const Row = styled.div`
  border: 1px solid #808080;
  padding: 12px;
  overflow-wrap: anywhere;
`
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message || 'Could not reach the server.'
  return error instanceof Error ? error.message : 'Outlook operation failed.'
}

export default function OutlookConnectionPanel(): React.JSX.Element {
  const [connections, setConnections] = useState<OutlookConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ startedAt: number; expiresAt: number } | null>(null)
  const alive = useRef(false)
  const refreshing = useRef(false)

  const refresh = useCallback(async () => {
    if (refreshing.current) return
    refreshing.current = true
    try {
      const data = await listOutlookConnections()
      if (alive.current) {
        setConnections(data)
        setError('')
      }
    } catch (err) {
      if (alive.current) setError(errorMessage(err))
    } finally {
      refreshing.current = false
      if (alive.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    alive.current = true
    void refresh()
    const onFocus = () => { void refresh() }
    window.addEventListener('focus', onFocus)
    return () => {
      alive.current = false
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  useEffect(() => {
    if (!pending) return
    const timer = window.setInterval(() => {
      if (Date.now() >= pending.expiresAt) {
        setPending(null)
        setMessage('Sign-in time has expired. If you did not finish, click Connect Outlook again.')
      } else void refresh()
    }, 3000)
    return () => window.clearInterval(timer)
  }, [pending, refresh])

  useEffect(() => {
    if (pending && connections.some(connection =>
      connection.status === 'connected' && new Date(connection.connectedAt).getTime() >= pending.startedAt
    )) {
      setPending(null)
      setMessage('Outlook connected successfully.')
    }
  }, [connections, pending])

  const connect = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (!window.api?.outlook?.openSignIn) throw new Error('Restart the updated desktop app to connect Outlook.')
      const result = await connectOutlook()
      // Server timestamps avoid differences between the desktop and server clock.
      const expiresAt = new Date(result.expiresAt).getTime()
      await window.api.outlook.openSignIn(result.authorizationUrl)
      if (!alive.current) return
      setPending({ startedAt: expiresAt - 10 * 60_000, expiresAt })
      setMessage('Complete Microsoft sign-in in your browser, then return here. Status updates automatically.')
    } catch (err) {
      if (alive.current) setError(errorMessage(err))
    } finally {
      if (alive.current) setBusy(false)
    }
  }

  const disconnect = async (connection: OutlookConnection) => {
    if (!window.confirm(`Disconnect ${connection.accountEmail} from this application? Existing requests will be kept.`)) return
    setBusy(true)
    setError('')
    try {
      await disconnectOutlook(connection.id)
      if (!alive.current) return
      setPending(null)
      setMessage('Disconnected. Existing requests were kept.')
      await refresh()
    } catch (err) {
      if (alive.current) setError(errorMessage(err))
    } finally {
      if (alive.current) setBusy(false)
    }
  }

  const check = async (connection: OutlookConnection) => {
    setBusy(true)
    setError('')
    try {
      const data = await checkOutlook(connection.id)
      if (alive.current) {
        setConnections(data)
        setMessage('Connection checked successfully.')
      }
    } catch (err) {
      await refresh()
      if (alive.current) setError(errorMessage(err))
    } finally {
      if (alive.current) setBusy(false)
    }
  }

  return (
    <Win95GroupBox legend="Outlook Connection">
      <Content>
        <p>Connect your personal Outlook account. Microsoft sign-in opens in your browser.</p>
        {loading && <p role="status">Loading connections…</p>}
        {!loading && connections.length === 0 && <p>No Outlook account connected.</p>}
        {connections.map(connection => (
          <Row key={connection.id}>
            <strong>{connection.accountEmail}</strong>
            <p>{connection.status === 'connected' ? '✓ Connected' : '⚠ Microsoft sign-in required'}</p>
            <Actions>
              {connection.status === 'connected' && (
                <WinButton type="button" disabled={busy} onClick={() => void check(connection)}>Check connection</WinButton>
              )}
              {connection.status === 'reconnect_required' && (
                <WinButton type="button" disabled={busy} onClick={() => void connect()}>Reconnect</WinButton>
              )}
              <WinButton type="button" disabled={busy} onClick={() => void disconnect(connection)}>Disconnect</WinButton>
            </Actions>
          </Row>
        ))}
        <Actions>
          <WinButton type="button" disabled={busy || Boolean(pending)} onClick={() => void connect()}>Connect Outlook</WinButton>
          <WinButton type="button" disabled={busy} onClick={() => void refresh()}>Refresh status</WinButton>
          {pending && <WinButton type="button" disabled={busy} onClick={() => {
            setPending(null)
            setMessage('You can retry sign-in. Starting again replaces the previous sign-in link.')
          }}>Retry sign-in</WinButton>}
        </Actions>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </Content>
    </Win95GroupBox>
  )
}
