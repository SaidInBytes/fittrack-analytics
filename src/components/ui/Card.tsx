import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/80 bg-card/90 p-6 shadow-[0_18px_60px_-42px_hsl(220_24%_10%)] backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('mb-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold tracking-normal', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('', className)} {...props} />
}
