import * as React from "react"
import { cn } from "@/lib/utils"

// Tabs Container


interface TabsContextValue {
    activeTab: string | null
    setActiveTab: (v: string) => void
    firstValue: React.MutableRefObject<string | null>
    initialized: React.MutableRefObject<boolean>
}
const TabsContext = React.createContext<TabsContextValue>({
    activeTab: null,
    setActiveTab: () => { },
    firstValue: { current: null },
    initialized: { current: false },
})

// Override: simple controlled version that reads defaultValue
interface TabsRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
}

function TabsRoot({ children, defaultValue, value, onValueChange, className, ...props }: TabsRootProps) {
    const [internalActiveTab, setInternalActiveTab] = React.useState<string>(defaultValue ?? "")
    
    const activeTab = value !== undefined ? value : internalActiveTab
    const setActiveTab = (v: string) => {
        if (value === undefined) {
            setInternalActiveTab(v)
        }
        if (onValueChange) {
            onValueChange(v)
        }
    }

    const firstValue = React.useRef<string | null>(null)
    const initialized = React.useRef(true)
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab, firstValue, initialized }}>
            <div className={cn("w-full", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

// TabsList
function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-lg bg-muted p-1 overflow-x-auto",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

// TabsTrigger
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}
function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = React.useContext(TabsContext)
    const isActive = activeTab === value
    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

// TabsContent
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}
function TabsContent({ value, children, className, ...props }: TabsContentProps) {
    const { activeTab } = React.useContext(TabsContext)
    if (activeTab !== value) return null
    return (
        <div
            className={cn("mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent }
