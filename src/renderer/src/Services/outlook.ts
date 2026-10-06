import http from './http'

export type OutlookConnection = {
  id: string
  accountEmail: string
  displayName: string
  status: 'connected' | 'reconnect_required'
  connectedAt: string
  lastTokenRefreshAt?: string
}

export async function listOutlookConnections(): Promise<OutlookConnection[]> {
  const response = await http.get<{ data: OutlookConnection[] }>('/outlook/auth/connections')
  return response.data.data
}

export async function connectOutlook(): Promise<{ authorizationUrl: string; expiresAt: string }> {
  const response = await http.post<{ data: { authorizationUrl: string; expiresAt: string } }>(
    '/outlook/auth/connect'
  )
  return response.data.data
}

export async function disconnectOutlook(id: string): Promise<void> {
  await http.delete(`/outlook/auth/connections/${encodeURIComponent(id)}`)
}

export async function checkOutlook(id: string): Promise<OutlookConnection[]> {
  const response = await http.post<{ data: OutlookConnection[] }>(
    `/outlook/auth/connections/${encodeURIComponent(id)}/check`
  )
  return response.data.data
}
