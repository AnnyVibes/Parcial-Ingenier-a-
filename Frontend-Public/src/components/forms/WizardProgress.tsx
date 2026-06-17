import { cn } from '@/lib/utils'

interface Props {
  current: number
  total: number
  labels: string[]
}

export function WizardProgress({ current, total, labels }: Props): JSX.Element {
  const pct = Math.round(((current + 1) / total) * 100)
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Paso {current + 1} de {total}: <span className="font-medium text-foreground">{labels[current]}</span>
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="hidden flex-wrap gap-1.5 md:flex">
        {labels.map((label, idx) => (
          <span
            key={label}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px]',
              idx === current
                ? 'bg-primary text-primary-foreground'
                : idx < current
                ? 'bg-green-600 text-white'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {idx + 1}. {label}
          </span>
        ))}
      </div>
    </div>
  )
}
