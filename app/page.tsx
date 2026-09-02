import { redirect } from 'next/navigation'
import DashboardShell from '@/features/dashboard/dashboard-shell'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return <DashboardShell user={{ name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Administrador', email: user.email ?? '', avatar: user.user_metadata?.avatar_url ?? '' }} />
}
