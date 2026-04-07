import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Win95Page from '../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../components/Win95/Win95Tabs'

import AccountDetailsPanel from '../components/account/AccountDetailsPanel'
import AccountSummaryPanel from '../components/account/AccountSummaryPanel'
import styled from 'styled-components'
import { userProfile as fetchProfile } from '../Services/user'
import { UserProfileInterface } from '../types/user.type'
import WinButton from '../components/Button/WinButton'

const TabContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
`

const TabFooter = styled.div`
  display: flex;
  justify-content: flex-start;
`

const UserAccount = () => {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfileInterface | null>(null)
  const [formData, setFormData] = useState<UserProfileInterface | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const response = await fetchProfile()

        if (isMounted) {
          setProfile(response.data)
          setFormData(response.data)
        }
      } catch {
        if (isMounted) {
          setError('Failed to load account details.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (field: keyof UserProfileInterface, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleDashboardNavigation = () => {
    if (profile?.role === 'admin') {
      navigate('/admin')
      return
    }

    if (profile?.role === 'employee') {
      navigate('/employee')
      return
    }

    navigate('/dashboard')
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError('')
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
    setError('')
  }

  const handleUpdate = async () => {
    if (!formData) return

    try {
      setSaving(true)
      setError('')

      // TODO: replace with real update service call
      setProfile(formData)
      setFormData(formData)
      setIsEditing(false)
    } catch {
      setError('Failed to update account details.')
    } finally {
      setSaving(false)
    }
  }

  const handleSecurityClick = () => {
    setActiveTab('security')
  }

  const generalTabContent = (
    <TabContentLayout>
      <AccountDetailsPanel
        formData={formData}
        loading={loading}
        error={error}
        isEditing={isEditing}
        saving={saving}
        onChange={handleChange}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onUpdate={handleUpdate}
      />

      <TabFooter>
        <WinButton type="button" onClick={handleDashboardNavigation}>
          Back
        </WinButton>
      </TabFooter>
    </TabContentLayout>
  )

  const securityTabContent = <div>Password and security settings here.</div>

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'general',
        label: 'General',
        content: generalTabContent
      },
      {
        id: 'security',
        label: 'Security',
        content: securityTabContent
      }
    ],
    [generalTabContent, securityTabContent]
  )

  const sidebar =
    activeTab === 'general' ? (
      <AccountSummaryPanel
        username={formData?.username}
        role={formData?.role}
        email={formData?.email}
        status="Active"
        onSecurityClick={handleSecurityClick}
        onPreferencesClick={() => {
          // TODO: wire preferences action
        }}
      />
    ) : null

  return (
    <Win95Page title="User Account" width="1100px" maxWidth="96vw" height="620px">
      <Win95Tabs
        items={tabs}
        defaultTabId="general"
        activeTab={activeTab}
        onChange={setActiveTab}
        sidebar={sidebar}
        sidebarWidth="345px"
      />
    </Win95Page>
  )
}

export default UserAccount
