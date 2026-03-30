"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
            {[
                { id: 'light', icon: Sun },
                { id: 'dark', icon: Moon },
                { id: 'system', icon: Laptop },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        theme === item.id
                            ? "bg-card text-brand-orange-500 shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={item.id.charAt(0).toUpperCase() + item.id.slice(1) + " Mode"}
                >
                    <item.icon className="h-4 w-4" />
                </button>
            ))}
        </div>
    );
}
