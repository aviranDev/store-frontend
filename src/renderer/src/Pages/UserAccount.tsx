import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Win95Page from '../components/Win95/Win95Page'
import Win95Tabs, { TabItem } from '../components/Win95/Win95Tabs'
import WinButton from '../components/Button/WinButton'

import AccountDetailsPanel from '../components/account/AccountDetailsPanel'
import SecurityPanel from '../components/account/SecurityPanel'
import { forceLogout } from '../Services/auth'

import { userProfile as fetchProfile } from '../Services/user'
import { UserProfileInterface } from '../types/user.type'
import { updatePasswordService } from '../Services/user'

const TabContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
  height: 100%;
`

const TabFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: auto;
`

const InfoContent = styled.div`
  padding: 8px 2px;
  color: ${({ theme }) => theme.colors.text};
`

const InfoTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
`

const InfoText = styled.p`
  margin: 0 0 8px 0;
  line-height: 1.4;
`

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialPasswordForm: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const UserAccount = () => {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfileInterface | null>(null)
  const [formData, setFormData] = useState<UserProfileInterface | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(initialPasswordForm)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

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

  const handleDelete = async () => {
    try {
      setError('')
      await Promise.resolve()
      navigate('/dashboard')
    } catch {
      setError('Failed to delete account.')
    }
  }

  const handlePasswordChange = async (field: keyof PasswordFormState, value: string) => {
    setPasswordMessage('')
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordCancel = () => {
    setPasswordForm(initialPasswordForm)
    setPasswordMessage('')
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage('Please fill in all password fields.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New password and confirm password must match.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long.')
      return
    }

    try {
      setSavingPassword(true)
      setPasswordMessage('')

      await updatePasswordService({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      setPasswordForm(initialPasswordForm)
      setPasswordMessage('Password updated successfully.')
      forceLogout()
    } catch (error: any) {
      setPasswordMessage(
        error?.response?.data?.message || error?.message || 'Failed to update password.'
      )
    } finally {
      setSavingPassword(false)
    }
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
        onDelete={handleDelete}
      />

      <TabFooter>
        <WinButton type="button" onClick={handleDashboardNavigation}>
          Back
        </WinButton>
      </TabFooter>
    </TabContentLayout>
  )

  const infoTabContent = (
    <TabContentLayout>
      <InfoContent>
        <InfoTitle>Account Info</InfoTitle>
        <InfoText>Here you can display other user information.</InfoText>
        <InfoText>
          For example: created date, last login, permissions, internal notes, or account activity.
        </InfoText>
      </InfoContent>

      <TabFooter>
        <WinButton type="button" onClick={handleDashboardNavigation}>
          Back
        </WinButton>
      </TabFooter>
    </TabContentLayout>
  )

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'general',
        label: 'General',
        content: generalTabContent
      },
      {
        id: 'info',
        label: 'Info',
        content: infoTabContent
      }
    ],
    [generalTabContent, infoTabContent]
  )

  return (
    <Win95Page title="User Account" width="1200px" maxWidth="96vw" height="800px">
      <Win95Tabs
        items={tabs}
        defaultTabId="general"
        activeTab={activeTab}
        onChange={setActiveTab}
        sidebar={
          activeTab === 'general' ? (
            <SecurityPanel
              passwordForm={passwordForm}
              savingPassword={savingPassword}
              passwordMessage={passwordMessage}
              onChange={handlePasswordChange}
              onCancel={handlePasswordCancel}
              onSubmit={handlePasswordSubmit}
            />
          ) : undefined
        }
        sidebarWidth="345px"
      />
    </Win95Page>
  )
}

export default UserAccount
