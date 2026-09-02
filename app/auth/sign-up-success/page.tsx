import Link from 'next/link'
import { CheckCircle2, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"><div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/20 text-primary"><Mail /></div><h1 className="mt-6 text-3xl font-semibold tracking-tight">Revisa tu correo</h1><p className="mt-3 leading-6 text-muted-foreground">Te enviamos un enlace para confirmar tu cuenta de El Creador Web. Después de confirmarla podrás iniciar sesión.</p><div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-primary" />La confirmación es necesaria por seguridad.</div><Link href="/auth/login" className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">Volver a iniciar sesión</Link></section></main>
}
