import { useMemo, useState } from 'react'
import { useLocalStorage, clearAppStorage } from './utils/storage'
import { calcTargets, GOALS } from './utils/nutrition'
import ProfileSetup from './components/ProfileSetup'
import TargetSummary from './components/TargetSummary'
import ComingSoon from './components/ComingSoon'

const TABS = [
  { id: 'hari-ini', label: 'Hari ini' },
  { id: 'catat', label: 'Catat makan' },
  { id: 'stok', label: 'Stok & harga' },
  { id: 'budget', label: 'Rencana budget' },
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'pengingat', label: 'Pengingat' },
]

export default function App() {
  const [profile, setProfile] = useLocalStorage('nt_profile', null)
  const [tab, setTab] = useState('hari-ini')
  const [editingProfile, setEditingProfile] = useState(false)
  const targets = useMemo(() => (profile ? calcTargets(profile) : null), [profile])

  const resetAll = () => {
    if (!window.confirm('Hapus semua data aplikasi di browser ini?')) return
    clearAppStorage()
    window.location.reload()
  }

  if (!profile || editingProfile) {
    return (
      <>
        <ProfileSetup
          initial={profile}
          onSave={(p) => { setProfile(p); setEditingProfile(false) }}
          onCancel={profile ? () => setEditingProfile(false) : null}
          onReset={profile ? resetAll : null}
        />
      </>
    )
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>NutriTrack</span>
        </div>
        <button className="profile-chip" onClick={() => setEditingProfile(true)}>
          <span className="profile-name">{profile.name || 'Profil'}</span>
          <span className="profile-goal">{GOALS[profile.goal]?.label}</span>
        </button>
      </header>

      <nav className="tabs" aria-label="Menu utama">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={'tab' + (tab === t.id ? ' is-active' : '')}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'hari-ini' && <TargetSummary profile={profile} targets={targets} />}
        {tab === 'catat' && <ComingSoon title="Catat makan" />}
        {tab === 'stok' && <ComingSoon title="Stok & harga" />}
        {tab === 'budget' && <ComingSoon title="Rencana budget" />}
        {tab === 'ringkasan' && <ComingSoon title="Ringkasan" />}
        {tab === 'pengingat' && <ComingSoon title="Pengingat" />}
      </main>
    </div>
  )
}
