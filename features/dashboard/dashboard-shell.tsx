'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Resumen', icon: LayoutDashboard },
  { label: 'CRM', icon: Users },
  { label: 'Finanzas', icon: CircleDollarSign },
  { label: 'Impuestos', icon: FileText },
  { label: 'Tareas', icon: ClipboardList },
  { label: 'Calendario', icon: CalendarDays },
]

const clients = [
  { name: 'Grupo Horizonte', type: 'Cliente activo', amount: '$18,500', color: 'bg-yellow-100 text-yellow-900' },
  { name: 'Casa Nómada', type: 'Propuesta enviada', amount: '$9,800', color: 'bg-blue-100 text-blue-900' },
  { name: 'Lumen Studio', type: 'En conversación', amount: '$6,200', color: 'bg-violet-100 text-violet-900' },
]

const initialTasks = [
  { title: 'Enviar propuesta a Casa Nómada', project: 'Ventas', due: 'Hoy, 15:00', done: false },
  { title: 'Revisar declaraciones de agosto', project: 'Impuestos', due: 'Mañana', done: false },
  { title: 'Reunión de seguimiento · Grupo Horizonte', project: 'CRM', due: 'Jue, 10:30', done: true },
  { title: 'Actualizar gastos del proyecto Lumen', project: 'Finanzas', due: 'Vie, 17:00', done: false },
]

export function DashboardShell() {
  const [active, setActive] = useState('Resumen')
  const [tasks, setTasks] = useState(initialTasks)
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleClients = useMemo(() => clients.filter((client) => client.name.toLowerCase().includes(query.toLowerCase())), [query])
  const completed = tasks.filter((task) => task.done).length

  function toggleTask(index: number) {
    setTasks((current) => current.map((task, itemIndex) => itemIndex === index ? { ...task, done: !task.done } : task))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness /></div>
            <div><p className="font-semibold tracking-tight">El Creador Web</p><p className="text-xs text-sidebar-foreground/55">Business OS</p></div>
          </div>
          <button className="lg:hidden" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}><X /></button>
        </div>
        <div className="mt-10 flex flex-col gap-2">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">Espacio de trabajo</p>
          {navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setMobileOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${active === label ? 'bg-primary text-primary-foreground font-semibold' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}><Icon className="size-4" />{label}</button>)}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"><Settings className="size-4" />Configuración</button>
          <div className="mt-4 flex items-center gap-3 border-t border-sidebar-border pt-5"><div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">LR</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Lucas Ramírez</p><p className="truncate text-xs text-sidebar-foreground/50">Administrador</p></div><ChevronDown className="size-4 text-sidebar-foreground/50" /></div>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-20 bg-foreground/30 lg:hidden" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}

      <div className="lg:pl-72">
        <header className="flex h-20 items-center justify-between border-b border-border bg-card px-5 md:px-10">
          <div className="flex items-center gap-4"><button className="lg:hidden" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><Menu /></button><div className="relative hidden w-72 md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar clientes, tareas..." className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none ring-ring focus:ring-2" /></div></div>
          <div className="flex items-center gap-4"><button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Notificaciones"><Bell className="size-5" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" /></button><div className="hidden h-7 w-px bg-border sm:block" /><p className="hidden text-sm text-muted-foreground sm:block">Martes, 2 de septiembre 2026</p></div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-medium text-muted-foreground">Buenos días, Lucas</p><h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{active === 'Resumen' ? 'Tu negocio, en control.' : active}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Una vista clara de lo que importa para que puedas enfocarte en hacer crecer El Creador Web.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"><Plus className="size-4" />Nueva actividad</button></div>

          {active !== 'Resumen' ? <ModuleView active={active} /> : <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[['Ingresos este mes', '$42,850', '+12.8%', 'vs. mes anterior'], ['Por cobrar', '$16,420', '8 facturas', 'pendientes'], ['Clientes activos', '24', '+3', 'este mes'], ['Tareas pendientes', String(tasks.length - completed), '2 vencen', 'esta semana']].map(([label, value, delta, note], index) => <div key={label} className={`rounded-xl border border-border bg-card p-5 ${index === 0 ? 'border-primary/40 bg-primary/[0.06]' : ''}`}><div className="flex items-start justify-between"><p className="text-sm text-muted-foreground">{label}</p>{index === 0 && <ArrowUpRight className="size-4 text-primary" />}</div><p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-muted-foreground"><span className={index < 3 ? 'font-semibold text-emerald-600' : 'font-semibold text-primary'}>{delta}</span> {note}</p></div>)}
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <section className="rounded-xl border border-border bg-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Flujo de ingresos</h2><p className="mt-1 text-sm text-muted-foreground">Ingresos vs. gastos · últimos 6 meses</p></div><button className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground">Este año <ChevronDown className="ml-1 inline size-3" /></button></div><div className="mt-8 flex h-52 items-end gap-3 sm:gap-6">{[['Abr', 48, 28], ['May', 65, 35], ['Jun', 52, 31], ['Jul', 78, 40], ['Ago', 68, 32], ['Sep', 90, 42]].map(([month, income, expense]) => <div key={month} className="flex flex-1 flex-col items-center gap-3"><div className="flex h-44 w-full items-end justify-center gap-1.5 sm:gap-2"><div className="w-3 rounded-t bg-primary sm:w-5" style={{ height: `${income}%` }} /><div className="w-3 rounded-t bg-muted-foreground/25 sm:w-5" style={{ height: `${expense}%` }} /></div><span className="text-xs text-muted-foreground">{month}</span></div>)}</div><div className="mt-5 flex gap-5 text-xs text-muted-foreground"><span><i className="mr-2 inline-block size-2 rounded-full bg-primary" />Ingresos</span><span><i className="mr-2 inline-block size-2 rounded-full bg-muted-foreground/25" />Gastos</span></div></section>

              <section className="rounded-xl border border-border bg-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Próximas tareas</h2><p className="mt-1 text-sm text-muted-foreground">{completed} de {tasks.length} completadas</p></div><button className="text-sm font-semibold text-primary hover:underline">Ver todas</button></div><div className="mt-6 flex flex-col gap-4">{tasks.slice(0, 4).map((task, index) => <div key={task.title} className="flex items-start gap-3"><button onClick={() => toggleTask(index)} className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${task.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`} aria-label={task.done ? 'Marcar pendiente' : 'Completar tarea'}>{task.done && <Check className="size-3.5" />}</button><div className="min-w-0 flex-1"><p className={`text-sm font-medium ${task.done ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.project} · {task.due}</p></div></div>)}</div></section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.5fr]">
              <section className="rounded-xl border border-border bg-card p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Salud del negocio</h2><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Excelente</span></div><div className="mt-6 flex items-center gap-5"><div className="relative flex size-28 items-center justify-center rounded-full" style={{ background: 'conic-gradient(var(--primary) 0 82%, var(--muted) 82% 100%)' }}><div className="flex size-20 items-center justify-center rounded-full bg-card text-2xl font-semibold">82</div></div><div className="flex flex-col gap-2 text-sm"><p><span className="mr-2 inline-block size-2 rounded-full bg-primary" />Ingresos estables</p><p><span className="mr-2 inline-block size-2 rounded-full bg-muted-foreground/30" />Cartera saludable</p><p><span className="mr-2 inline-block size-2 rounded-full bg-primary/40" />Impuestos al día</p></div></div></section>
              <section className="rounded-xl border border-border bg-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Clientes recientes</h2><p className="mt-1 text-sm text-muted-foreground">Seguimiento de tu cartera comercial</p></div><button className="text-sm font-semibold text-primary hover:underline">Ir al CRM</button></div><div className="mt-5 grid gap-3 md:grid-cols-3">{visibleClients.map((client) => <div key={client.name} className="rounded-lg border border-border p-4"><div className="flex items-center gap-3"><div className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${client.color}`}>{client.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{client.name}</p><p className="text-xs text-muted-foreground">{client.type}</p></div></div><p className="mt-4 text-sm font-semibold">{client.amount}<span className="ml-1 text-xs font-normal text-muted-foreground">en oportunidad</span></p></div>)}</div></section>
            </div>
          </>}
        </main>
      </div>
    </div>
  )
}

function ModuleView({ active }: { active: string }) {
  const descriptions: Record<string, string> = { CRM: 'Gestiona relaciones, oportunidades y el crecimiento de tu cartera.', Finanzas: 'Controla ingresos, gastos, facturas y la salud financiera.', Impuestos: 'Mantén tus obligaciones fiscales organizadas y al día.', Tareas: 'Prioriza el trabajo que mueve tu negocio hacia adelante.', Calendario: 'Visualiza reuniones, entregas y momentos importantes.' }
  return <section className="mt-8 rounded-xl border border-border bg-card p-8"><div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BriefcaseBusiness className="size-5" /></div><h2 className="mt-6 text-2xl font-semibold">Módulo de {active}</h2><p className="mt-2 max-w-lg leading-6 text-muted-foreground">{descriptions[active] || 'Configura este espacio para adaptarlo a la operación de tu negocio.'}</p><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-lg bg-muted p-5"><p className="text-sm font-semibold">Vista general</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Aquí podrás consultar y administrar toda la información relacionada.</p></div><div className="rounded-lg bg-muted p-5"><p className="text-sm font-semibold">Acciones rápidas</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Crea nuevos registros y mantén el flujo de trabajo actualizado.</p></div><div className="rounded-lg bg-muted p-5"><p className="text-sm font-semibold">Próximamente</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Este módulo está listo para conectarse con tus datos reales.</p></div></div></section>
}

export default DashboardShell
