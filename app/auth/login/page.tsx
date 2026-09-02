'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BriefcaseBusiness, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } })
    if (authError) { setError('No se pudo iniciar sesión. Inténtalo de nuevo.'); setLoading(false) }
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><div className="w-full max-w-md"><div className="mb-10 flex items-center justify-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div><div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-muted-foreground">Business OS</p></div></div><section className="rounded-2xl border border-border bg-card p-8 shadow-sm"><p className="text-sm font-medium text-muted-foreground">Tu espacio de trabajo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1><p className="mt-3 leading-6 text-muted-foreground">Administra tu negocio desde un solo lugar.</p><button onClick={signInWithGoogle} disabled={loading} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : <><span className="flex size-6 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground">G</span>Continuar con Google<ArrowRight className="ml-auto size-4" /></>}</button>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<p className="mt-8 text-center text-xs leading-5 text-muted-foreground">Al continuar, aceptas los términos de servicio y la política de privacidad.</p></section></div></main>
}
