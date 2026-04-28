'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'

type PersonalForm = {
  fullName: string
  birthMonth: string
  birthDay: string
  birthYear: string
  goal: string
  bio: string
  socialInstagram: string
  socialX: string
  socialWebsite: string
  phoneCountryCode: string
  phoneNumber: string
  contactOptIn: boolean
  contactSms: boolean
  contactWhatsapp: boolean
}

const EMPTY_FORM: PersonalForm = {
  fullName: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  goal: '',
  bio: '',
  socialInstagram: '',
  socialX: '',
  socialWebsite: '',
  phoneCountryCode: '+1',
  phoneNumber: '',
  contactOptIn: false,
  contactSms: true,
  contactWhatsapp: false,
}

export default function PersonalContent() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PersonalForm>(EMPTY_FORM)
  const { toastMessage, showToast, clearToast } = useToast()

  useEffect(() => {
    load()
  }, [])

  const birthdayPreview = useMemo(() => {
    if (!form.birthMonth || !form.birthDay) return 'Birthday not set'
    return form.birthYear
      ? `${form.birthMonth}/${form.birthDay}/${form.birthYear}`
      : `${form.birthMonth}/${form.birthDay}`
  }, [form.birthMonth, form.birthDay, form.birthYear])

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const md = (user?.user_metadata ?? {}) as Record<string, any>

      setForm({
        fullName: md.profile_full_name ?? '',
        birthMonth: md.profile_birth_month ? String(md.profile_birth_month) : '',
        birthDay: md.profile_birth_day ? String(md.profile_birth_day) : '',
        birthYear: md.profile_birth_year ? String(md.profile_birth_year) : '',
        goal: md.profile_goal ?? '',
        bio: md.profile_bio ?? '',
        socialInstagram: md.profile_social_instagram ?? '',
        socialX: md.profile_social_x ?? '',
        socialWebsite: md.profile_social_website ?? '',
        phoneCountryCode: md.profile_phone_country_code ?? '+1',
        phoneNumber: md.profile_phone_number ?? '',
        contactOptIn: !!md.profile_contact_opt_in,
        contactSms: md.profile_contact_sms == null ? true : !!md.profile_contact_sms,
        contactWhatsapp: !!md.profile_contact_whatsapp,
      })
    } catch {
      showToast('Failed to load profile details')
    } finally {
      setLoading(false)
    }
  }

  function validate(): string | null {
    const month = form.birthMonth.trim()
    const day = form.birthDay.trim()
    const year = form.birthYear.trim()

    if ((month || day || year) && !(month && day)) {
      return 'Birthday needs at least month and day'
    }

    if (month) {
      const m = Number(month)
      if (!Number.isInteger(m) || m < 1 || m > 12) return 'Month must be 1-12'
    }

    if (day) {
      const d = Number(day)
      if (!Number.isInteger(d) || d < 1 || d > 31) return 'Day must be 1-31'
    }

    if (year) {
      if (!/^\d{4}$/.test(year)) return 'Year must be 4 digits'
      const y = Number(year)
      const current = new Date().getFullYear()
      if (y < 1900 || y > current) return `Year must be between 1900 and ${current}`
    }

    if (form.contactOptIn) {
      if (!form.phoneNumber.trim()) return 'Phone number is required for contact opt-in'
      if (!form.contactSms && !form.contactWhatsapp) return 'Select SMS or WhatsApp for contact opt-in'
    }

    return null
  }

  async function handleSave() {
    const error = validate()
    if (error) {
      showToast(error)
      return
    }

    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: {
          profile_full_name: form.fullName.trim() || null,
          profile_birth_month: form.birthMonth.trim() || null,
          profile_birth_day: form.birthDay.trim() || null,
          profile_birth_year: form.birthYear.trim() || null,
          profile_goal: form.goal.trim() || null,
          profile_bio: form.bio.trim() || null,
          profile_social_instagram: form.socialInstagram.trim() || null,
          profile_social_x: form.socialX.trim() || null,
          profile_social_website: form.socialWebsite.trim() || null,
          profile_phone_country_code: form.phoneCountryCode.trim() || '+1',
          profile_phone_number: form.phoneNumber.trim() || null,
          profile_contact_opt_in: !!form.contactOptIn,
          profile_contact_sms: !!form.contactOptIn && !!form.contactSms,
          profile_contact_whatsapp: !!form.contactOptIn && !!form.contactWhatsapp,
          profile_contact_opt_in_at: form.contactOptIn ? new Date().toISOString() : null,
          profile_contact_opt_in_source: form.contactOptIn ? 'personal_page_v1' : null,
        },
      })
      showToast('Saved')
    } catch {
      showToast("Couldn't save details - check your connection")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-32 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="About You" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <div className="rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3">
          <p className="font-sans text-sm font-semibold text-ink">Lightweight, Optional Profile</p>
          <p className="font-sans text-sm text-ink-soft mt-1 leading-snug">
            These details help personalization and future sharing features. Daily logging stays unblocked.
          </p>
        </div>

        <section className="rounded-card border-[1.5px] border-border bg-card px-4 py-3 flex flex-col gap-2">
          <p className="font-sans text-sm font-semibold text-ink">Identity</p>
          <Input
            variant="light"
            placeholder="Full Name (Optional)"
            value={form.fullName}
            onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
          />
        </section>

        <section className="rounded-card border-[1.5px] border-border bg-card px-4 py-3 flex flex-col gap-2">
          <p className="font-sans text-sm font-semibold text-ink">Birthday</p>
          <div className="grid grid-cols-3 gap-2">
            <Input
              variant="light"
              placeholder="Month"
              inputMode="numeric"
              value={form.birthMonth}
              onChange={e => setForm(prev => ({ ...prev, birthMonth: e.target.value.replace(/[^0-9]/g, '') }))}
            />
            <Input
              variant="light"
              placeholder="Day"
              inputMode="numeric"
              value={form.birthDay}
              onChange={e => setForm(prev => ({ ...prev, birthDay: e.target.value.replace(/[^0-9]/g, '') }))}
            />
            <Input
              variant="light"
              placeholder="Year (Optional)"
              inputMode="numeric"
              value={form.birthYear}
              onChange={e => setForm(prev => ({ ...prev, birthYear: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
            />
          </div>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{birthdayPreview}</p>
        </section>

        <section className="rounded-card border-[1.5px] border-border bg-card px-4 py-3 flex flex-col gap-2">
          <p className="font-sans text-sm font-semibold text-ink">Goals & Bio</p>
          <Textarea
            variant="light"
            rows={3}
            placeholder="Goal statement (What are you building in this challenge?)"
            value={form.goal}
            onChange={e => setForm(prev => ({ ...prev, goal: e.target.value }))}
          />
          <Textarea
            variant="light"
            rows={3}
            placeholder="Short bio (Optional)"
            value={form.bio}
            onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
          />
        </section>

        <section className="rounded-card border-[1.5px] border-border bg-card px-4 py-3 flex flex-col gap-2">
          <p className="font-sans text-sm font-semibold text-ink">Social Links (Optional)</p>
          <Input
            variant="light"
            placeholder="Instagram"
            value={form.socialInstagram}
            onChange={e => setForm(prev => ({ ...prev, socialInstagram: e.target.value }))}
          />
          <Input
            variant="light"
            placeholder="X / Twitter"
            value={form.socialX}
            onChange={e => setForm(prev => ({ ...prev, socialX: e.target.value }))}
          />
          <Input
            variant="light"
            placeholder="Website"
            value={form.socialWebsite}
            onChange={e => setForm(prev => ({ ...prev, socialWebsite: e.target.value }))}
          />
        </section>

        <section className="rounded-card border-[1.5px] border-border bg-card px-4 py-3 flex flex-col gap-2">
          <p className="font-sans text-sm font-semibold text-ink">Optional Contact</p>
          <p className="font-sans text-xs text-ink-soft leading-snug">
            Add a number if you want challenge updates and support messages by SMS or WhatsApp.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Input
              variant="light"
              placeholder="Code"
              value={form.phoneCountryCode}
              onChange={e => setForm(prev => ({ ...prev, phoneCountryCode: e.target.value }))}
            />
            <Input
              variant="light"
              className="col-span-2"
              placeholder="Phone Number"
              inputMode="tel"
              value={form.phoneNumber}
              onChange={e => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>

          <label className="flex items-start gap-2 mt-1">
            <input
              type="checkbox"
              checked={form.contactOptIn}
              onChange={e => setForm(prev => ({ ...prev, contactOptIn: e.target.checked }))}
              className="mt-0.5"
            />
            <span className="font-sans text-sm text-ink-soft leading-snug">
              You may contact me with challenge updates and offers.
            </span>
          </label>

          {form.contactOptIn && (
            <div className="flex items-center gap-4 pl-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.contactSms}
                  onChange={e => setForm(prev => ({ ...prev, contactSms: e.target.checked }))}
                />
                <span className="font-sans text-sm text-ink-soft">SMS</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.contactWhatsapp}
                  onChange={e => setForm(prev => ({ ...prev, contactWhatsapp: e.target.checked }))}
                />
                <span className="font-sans text-sm text-ink-soft">WhatsApp</span>
              </label>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-2 pt-1">
          <Btn variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Btn>
          <Btn variant="outline" onClick={() => router.push('/profile')}>
            Back To Profile
          </Btn>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}

