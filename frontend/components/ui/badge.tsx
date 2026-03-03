import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant =
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "info"
    | "indigo"
    | "cyan"
    | "neutral"
    | "transit"
    | "pending"
    | "delivered"
    | "cancelled"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                {
                    // default — navy
                    "border-transparent bg-primary text-primary-foreground": variant === "default",
                    // secondary — blue tint
                    "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
                    // outline
                    "text-foreground border-border bg-transparent": variant === "outline",
                    // destructive — orange-dark
                    "border-transparent bg-destructive text-destructive-foreground": variant === "destructive",
                    // success — brand blue
                    "border-transparent bg-success-muted text-success": variant === "success",
                    // warning — yellow
                    "border-transparent bg-warning-muted text-warning-foreground": variant === "warning",
                    // info — blue
                    "border-transparent bg-blue-50 text-blue-700": variant === "info",
                    // indigo
                    "border-transparent bg-indigo-50 text-indigo-700": variant === "indigo",
                    // cyan
                    "border-transparent bg-cyan-50 text-cyan-700": variant === "cyan",
                    // neutral
                    "border-border bg-muted text-muted-foreground": variant === "neutral",

                    // Semantic shipment statuses
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

/** Maps a shipment status string → Badge variant */
export function statusVariant(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
        case "rfq": return "warning"
        case "processing": return "info"
        case "transit": return "indigo"
        case "at_destination": return "cyan"
        case "delivered": return "success"
        case "closed": return "neutral"
        case "cancelled": return "destructive"
        case "pending": return "pending"
        default: return "secondary"
    }
}

export { Badge }
