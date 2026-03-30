import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
        const classes = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
            {
                // default = primary navy
                "bg-primary text-primary-foreground hover:bg-navy-600 shadow-sm hover:shadow-md": variant === "default",
                // accent = orange CTA
                "bg-accent text-accent-foreground hover:bg-orange-600 shadow-sm hover:shadow-md": variant === "accent",
                // destructive = orange-dark
                "bg-destructive text-destructive-foreground hover:bg-brand-orange-800": variant === "destructive",
                // outline = border blue-500 + text blue-600, hover bg blue-50
                "border-2 border-brand-blue-500 text-link bg-transparent hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20": variant === "outline",
                // secondary = brand blue tint
                "bg-secondary text-secondary-foreground hover:bg-brand-blue-100 dark:hover:bg-brand-blue-900/20": variant === "secondary",
                // ghost
                "hover:bg-navy-50 hover:text-foreground dark:hover:bg-muted/40": variant === "ghost",
                // link
                "text-link underline-offset-4 hover:underline": variant === "link",

                "h-10 px-4 py-2": size === "default",
                "h-8 rounded-md px-3 text-xs": size === "sm",
                "h-11 rounded-md px-8 text-base": size === "lg",
                "h-10 w-10 p-0": size === "icon",
            },
            className
        )

        // asChild: merge button classes onto child element (e.g. <Link>)
        if (asChild && React.isValidElement(children)) {
            const child = children as React.ReactElement<{ className?: string }>;
            return React.cloneElement(child, {
                className: cn(classes, child.props.className),
            });
        }

        return (
            <button ref={ref} className={classes} {...props}>
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
