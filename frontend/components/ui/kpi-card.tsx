import * as React from "react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    trend?: {
        value: number
        label: string
        isPositive?: boolean
    }
    className?: string
    accent?: boolean /** Highlight card with orange accent border */
}

export function KpiCard({ title, value, icon, trend, className, accent = false }: KpiCardProps) {
    return (
        <div
            className={cn(
                "relative bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden",
                accent && "border-l-4 border-l-accent",
                className
            )}
        >
            {/* subtle navy gradient corner */}
            <div className="absolute -top-6 -end-6 h-16 w-16 rounded-full bg-brand-navy-50 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                    {icon && (
                        <div className="p-2.5 rounded-lg bg-brand-navy-50 text-brand-navy">
                            {icon}
                        </div>
                    )}
                </div>

                <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>

                {trend && (
                    <div className="mt-3 flex items-center gap-1.5">
                        <span
                            className={cn(
                                "text-xs font-semibold px-1.5 py-0.5 rounded",
                                trend.isPositive === true && "bg-success-muted text-success",
                                trend.isPositive === false && "bg-brand-orange-50 text-brand-orange-700",
                                trend.isPositive === undefined && "text-muted-foreground"
                            )}
                        >
                            {trend.isPositive === true && "+"}
                            {trend.isPositive === false && ""}
                            {trend.value}
                        </span>
                        <span className="text-xs text-muted-foreground">{trend.label}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
