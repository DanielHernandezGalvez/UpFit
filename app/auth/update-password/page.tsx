'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)))
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    setError('')
    const { error: updateError } = await createClient().auth.updateUser({ password })
    if (updateError) setError('No pudimos actualizar tu contraseña. Solicita un nuevo enlace.')
    else setSaved(true)
    setLoading(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><div className="w-full max-w-md"><div className="mb-10 flex items-center justify-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div><div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-muted-foreground">Business OS</p></div></div><section className="rounded-2xl border border-border bg-card p-8 shadow-sm"><Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Volver al acceso</Link><h1 className="mt-6 text-3xl font-semibold tracking-tight">Crea una nueva contraseña</h1>{saved ? <div className="mt-8 flex flex-col gap-4"><div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm leading-6"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />Tu contraseña se actualizó correctamente.</div><Link href="/auth/login" className="flex h-12 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Ir a iniciar sesión</Link></div> : !ready ? <p className="mt-4 leading-6 text-muted-foreground">Este enlace no es válido o ya expiró. Solicita uno nuevo para continuar.</p> : <form onSubmit={updatePassword} className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="password">Nueva contraseña<input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="confirmation">Confirmar contraseña<input id="confirmation" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><button type="submit" disabled={loading} className="flex h-12 items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : 'Actualizar contraseña'}</button>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</form>}</section></div></main>
}
