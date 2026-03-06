import * as React from "react"
import { cn } from "@/lib/utils"
import { type BadgeVariant, statusVariant } from "@/lib/status"

export type { BadgeVariant }
export { statusVariant }

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                {
                    "border-transparent bg-primary text-primary-foreground": variant === "default",
                    "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
                    "text-foreground border-border bg-transparent": variant === "outline",
                    "border-transparent bg-destructive text-destructive-foreground": variant === "destructive",
                    "border-transparent bg-success-muted text-success": variant === "success",
                    "border-transparent bg-warning-muted text-warning-foreground": variant === "warning",
                    "border-transparent bg-blue-50 text-blue-700": variant === "info",
                    "border-transparent bg-indigo-50 text-indigo-700": variant === "indigo",
                    "border-transparent bg-cyan-50 text-cyan-700": variant === "cyan",
                    "border-border bg-muted text-muted-foreground": variant === "neutral",
                    "badge-transit": variant === "transit",
                    "badge-pending": variant === "pending",
                    "badge-delivered": variant === "delivered",
                    "badge-cancelled": variant === "cancelled",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
