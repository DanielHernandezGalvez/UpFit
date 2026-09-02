'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { BriefcaseBusiness, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { full_name: name },
      },
    })

    if (authError) {
      const errorText = authError.message.toLowerCase()
      setError(errorText.includes('password') ? 'La contraseña debe tener al menos 6 caracteres.' : 'No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.')
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.assign('/')
      return
    }

    setMessage('Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada.')
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div>
          <div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-muted-foreground">Business OS</p></div>
        </div>
        <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Tu espacio de trabajo</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Crea tu cuenta</h1>
          <p className="mt-3 leading-6 text-muted-foreground">Empieza a organizar tu negocio en un solo lugar.</p>
          <form onSubmit={handleSignUp} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="name">Nombre completo<input id="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">Correo electrónico<input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="password">Contraseña<input id="password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-lg border border-border bg-background px-3 font-normal outline-none ring-primary transition focus:ring-2" /></label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {message && <p role="status" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}{loading ? 'Creando cuenta…' : 'Crear cuenta'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">¿Ya tienes una cuenta? <Link href="/auth/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link></p>
        </section>
      </div>
    </main>
  )
}
