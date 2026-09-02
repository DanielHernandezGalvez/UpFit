'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { BriefcaseBusiness, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message.toLowerCase().includes('confirm') ? 'Confirma tu correo electrónico antes de entrar.' : 'El correo o la contraseña no son correctos.')
      setLoading(false)
      return
    }
    window.location.assign('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center justify-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div><div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-muted-foreground">Business OS</p></div></div>
        <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Tu espacio de trabajo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1><p className="mt-3 leading-6 text-muted-foreground">Inicia sesión para administrar tu negocio.</p>
          <form onSubmit={signInWithEmail} className="mt-8 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">Correo electrónico<input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><label className="flex flex-col gap-2 text-sm font-medium" htmlFor="password">Contraseña<input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label><div className="flex justify-end"><Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">¿Olvidaste tu contraseña?</Link></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">{loading ? <><Loader2 className="size-4 animate-spin" />Iniciando sesión…</> : 'Iniciar sesión'}</button></form>
          <div className="mt-6 border-t border-border pt-6 text-center"><p className="text-sm text-muted-foreground">¿Es tu primera vez aquí?</p><Link href="/auth/sign-up" className="mt-2 inline-block font-semibold text-primary hover:underline">Crear una cuenta nueva</Link></div>
        </section>
      </div>
    </main>
  )
}
