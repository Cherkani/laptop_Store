interface SectionDividerProps {
  label: string
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-4 bg-sky-500/10 dark:bg-sky-500/15 px-6 py-3 border-y border-sky-400/20">
      <div className="h-px flex-1 bg-sky-400/30" />
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-500 dark:text-sky-400 whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-sky-400/30" />
    </div>
  )
}
