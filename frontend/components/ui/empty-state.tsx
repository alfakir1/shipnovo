import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    icon?: React.ReactNode
    illustrationSrc?: string
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export function EmptyState({ icon, illustrationSrc, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
            {illustrationSrc ? (
                <div className="relative h-32 w-32 mb-6 opacity-90 mx-auto">
                    <Image src={illustrationSrc} alt={title} fill className="object-contain" />
                </div>
            ) : icon ? (
                <div className="mb-4 p-5 rounded-2xl bg-brand-navy-50 text-brand-navy">
                    {icon}
                </div>
            ) : null}

            <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
            {description && <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}
