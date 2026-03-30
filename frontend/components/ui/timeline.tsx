import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineItem {
    title: string
    description?: string
    date?: string
    status?: "completed" | "current" | "pending"
}

interface TimelineProps {
    items: TimelineItem[]
    className?: string
}

export function Timeline({ items, className }: TimelineProps) {
    return (
        <div className={cn("relative", className)}>
            {items.map((item, i) => {
                const isLast = i === items.length - 1
                const status = item.status ?? (i === 0 ? "current" : "pending")
                return (
                    <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Line */}
                        {!isLast && (
                            <div className="absolute start-[14px] top-7 bottom-0 w-px bg-border" />
                        )}

                        {/* Dot */}
                        <div className="relative z-10 mt-1 flex-shrink-0">
                            <div
                                className={cn(
                                    "h-7 w-7 rounded-full border-2 flex items-center justify-center shadow-sm",
                                    status === "completed" && "border-brand-blue-500 bg-brand-blue-50",
                                    status === "current" && "border-accent bg-brand-orange-50",
                                    status === "pending" && "border-border bg-muted"
                                )}
                            >
                                {status === "completed" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-brand-blue-500" />
                                )}
                                {status === "current" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
                                )}
                                {status === "pending" && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className={cn(
                                "text-sm font-semibold",
                                status === "pending" ? "text-muted-foreground" : "text-foreground"
                            )}>
                                {item.title}
                            </p>
                            {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                            {item.date && (
                                <p className="text-[11px] text-muted-foreground/70 font-medium mt-1">{item.date}</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
