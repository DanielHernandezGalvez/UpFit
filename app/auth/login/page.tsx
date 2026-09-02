'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, BriefcaseBusiness, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message.toLowerCase().includes('confirm') ? 'Confirma tu correo electrónico antes de entrar.' : 'El correo o la contraseña no son correctos.')
      setLoading(false)
      return
    }
    window.location.assign('/')
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><div className="w-full max-w-md"><div className="mb-10 flex items-center justify-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div><div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-muted-foreground">Business OS</p></div></div><section className="rounded-2xl border border-border bg-card p-8 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Tu espacio de trabajo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1><p className="mt-3 leading-6 text-muted-foreground">Administra tu negocio desde un solo lugar.</p><form onSubmit={signInWithEmail} className="mt-8 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">Correo electrónico<input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="password">Contraseña<input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><div className="flex justify-end"><Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">¿Olvidaste tu contraseña?</Link></div><button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : <>Ingresar con correo electrónico<ArrowRight className="ml-auto size-4" /></>}</button></form>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<p className="mt-8 text-center text-xs leading-5 text-muted-foreground">Al continuar, aceptas los términos de servicio y la política de privacidad.</p></section></div></main>
}
