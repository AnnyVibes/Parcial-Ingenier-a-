import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string
}

export function Avatar({ initials, className, ...props }: AvatarProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground',
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
