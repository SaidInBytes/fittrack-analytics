import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description: string
  eyebrow: string
  icon: LucideIcon
  meta?: string
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  meta,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-zinc-900/10 bg-zinc-950 px-5 py-5 text-white shadow-[0_24px_80px_-52px_black] sm:px-6">
      <div className="surface-grid absolute inset-0 opacity-[0.08]" />
      <div className="absolute -right-12 -top-16 h-40 w-40 bg-emerald-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
            <Icon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-300">{description}</p>
          </div>
        </div>
        {meta && (
          <div className="rounded-md border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-zinc-200">
            {meta}
          </div>
        )}
      </div>
    </section>
  )
}
