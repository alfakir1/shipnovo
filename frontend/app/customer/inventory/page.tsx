'use client';

import { useWarehouses, useWarehouseInventory } from "@/hooks/useShipments";
import { useI18n } from "@/components/providers/I18nProvider";
import { Warehouse, Boxes, MapPin, ExternalLink, Info } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CustomerStoragePage() {
    useI18n();
    const { data: warehouses, isLoading: loadingW } = useWarehouses();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: inventory, isLoading: loadingI } = useWarehouseInventory(selectedId);

    // Auto-select first warehouse
    useEffect(() => {
        if (warehouses && warehouses.length > 0 && selectedId === null) {
            setTimeout(() => setSelectedId(warehouses[0].id), 0);
        }
    }, [warehouses, selectedId]);

    const selectedWarehouse = warehouses?.find((w) => w.id === selectedId);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">My Stored Goods</h1>
                <p className="text-sm text-muted-foreground mt-1">Monitor your inventory across all our warehouse facilities.</p>
            </div>

            {loadingW ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                </div>
            ) : (warehouses?.length ?? 0) > 0 ? (
                <>
                    {/* Warehouse Selector Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {warehouses?.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => setSelectedId(w.id)}
                                className={`p-4 rounded-xl border text-left transition-all ${selectedId === w.id
                                    ? "border-[var(--brand-orange-500)] bg-orange-50/20 ring-1 ring-[var(--brand-orange-500)]"
                                    : "border-border bg-card hover:border-[var(--brand-navy-200)]"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Warehouse className={`h-4 w-4 ${selectedId === w.id ? "text-[var(--brand-orange-500)]" : "text-muted-foreground"}`} />
                                    <span className="text-xs font-black uppercase tracking-wider truncate">{w.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {w.location}
                                </div>
                            </button>
                        ))}
                        <button className="p-4 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                            <PlusIcon className="h-4 w-4" />
                            <span className="text-xs font-bold">Book Space</span>
                        </button>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-[var(--brand-navy-50)]/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Boxes className="h-4 w-4 text-[var(--brand-navy-900)]" />
                                <h2 className="text-sm font-bold text-foreground">Stock in {selectedWarehouse?.name}</h2>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-[var(--brand-navy-900)]">
                                <Info className="h-3.5 w-3.5" /> Storage Details
                            </Button>
                        </div>

                        {loadingI ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                            </div>
                        ) : (inventory?.length ?? 0) > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/20">
                                        <tr>
                                            <th className="px-6 py-3">SKU</th>
                                            <th className="px-6 py-3">Product Name</th>
                                            <th className="px-6 py-3 text-center">Quantity</th>
                                            <th className="px-6 py-3 text-right">Total Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {inventory?.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                                    {item.sku}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-foreground">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center h-7 px-3 rounded-full bg-blue-50 text-blue-700 font-bold text-xs ring-1 ring-inset ring-blue-700/10">
                                                        {item.quantity} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-[var(--brand-navy-900)]">
                                                    {(item.quantity * item.volume_per_unit).toFixed(2)} m³
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState title="No items found" description="You don't have any items stored in this warehouse." className="py-20" />
                        )}

                        <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <span>Showing {inventory?.length || 0} unique SKUs</span>
                                <span>Total Volume: {inventory?.reduce((acc: number, item) => acc + (item.quantity * item.volume_per_unit), 0).toFixed(2)} m³</span>
                            </div>
                            <button className="font-bold flex items-center gap-1 hover:text-foreground">
                                Export PDF <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState
                    title="No Storage Found"
                    description="You don't have any items stored in our warehouses yet."
                    className="py-12"
                    action={<Button className="font-bold mt-4">Book New Storage</Button>}
                />
            )}
        </div>
    );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
