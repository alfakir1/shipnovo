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
                    "bg-brand-blue-50 text-brand-blue-600 border-brand-blue-100 dark:bg-brand-blue-900/25 dark:text-brand-blue-200 dark:border-brand-blue-700/40": variant === "success" || variant === "info" || variant === "transit",
                    "bg-brand-yellow-50 text-brand-yellow-700 border-brand-yellow-100 dark:bg-brand-yellow-900/20 dark:text-brand-yellow-200 dark:border-brand-yellow-700/40": variant === "warning" || variant === "pending",
                    "bg-brand-orange-50 text-brand-orange-700 border-brand-orange-100 dark:bg-brand-orange-900/20 dark:text-brand-orange-200 dark:border-brand-orange-700/40": variant === "cancelled",
                    "bg-navy-100 text-navy-600 border-navy-200 dark:bg-navy-800/60 dark:text-navy-100 dark:border-navy-700": variant === "neutral" || variant === "indigo" || variant === "cyan",
                    "bg-navy-50 text-navy-700 border-navy-100 dark:bg-navy-800/60 dark:text-navy-100 dark:border-navy-700": variant === "delivered",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
