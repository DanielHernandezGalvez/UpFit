'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/update-password`,
    })
    if (resetError) setError('No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.')
    else setSent(true)
    setLoading(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><div className="w-full max-w-md"><div className="mb-10 flex items-center justify-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div><div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-muted-foreground">Business OS</p></div></div><section className="rounded-2xl border border-border bg-card p-8 shadow-sm"><Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Volver al acceso</Link><h1 className="mt-6 text-3xl font-semibold tracking-tight">Recupera tu contraseña</h1><p className="mt-3 leading-6 text-muted-foreground">Te enviaremos un enlace seguro para crear una nueva contraseña.</p>{sent ? <div className="mt-8 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm leading-6">Revisa tu correo electrónico. Si existe una cuenta asociada, recibirás instrucciones para recuperar el acceso.</div> : <form onSubmit={requestReset} className="mt-8 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">Correo electrónico<input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : 'Enviar enlace de recuperación'}</button>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</form>}</section></div></main>
}
