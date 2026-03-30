'use client';

import { useWarehouses, useWarehouseInventory } from "@/hooks/useShipments";
import { Warehouse as WarehouseIcon, MapPin, BarChart3, Plus, Boxes } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export default function PartnerWarehousesPage() {
    const { data: warehouses, isLoading: loadingW } = useWarehouses();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: inventory, isLoading: loadingI } = useWarehouseInventory(selectedId);

    const selectedWarehouse = warehouses?.find((w) => w.id === selectedId);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Warehouse Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your facilities and track stored inventory.</p>
                </div>
                <Button className="font-bold gap-2">
                    <Plus className="h-4 w-4" /> Add Warehouse
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Warehouse List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Your Facilities</h2>
                    {loadingW ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                    ) : (warehouses?.length ?? 0) > 0 ? (
                        warehouses?.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => setSelectedId(w.id)}
                                className={cn(
                                    "w-full text-left p-5 rounded-xl border transition-all hover:shadow-md group",
                                    selectedId === w.id
                                        ? "border-brand-orange-500 bg-brand-orange-50/30"
                                        : "border-border bg-card"
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-navy-50 text-navy-900 flex items-center justify-center">
                                        <WarehouseIcon className="h-5 w-5" />
                                    </div>
                                    <Badge variant={w.status === 'active' ? 'success' : 'pending'}>{w.status}</Badge>
                                </div>
                                <h3 className="font-bold text-foreground group-hover:text-[var(--brand-orange-600)] transition-colors">{w.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-4">
                                    <MapPin className="h-3 w-3" /> {w.location}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                                        <span>Capacity Utilization</span>
                                        <span>{Math.round(((w.total_capacity - w.available_capacity) / w.total_capacity) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--brand-orange-500)] transition-all"
                                            style={{ width: `${((w.total_capacity - w.available_capacity) / w.total_capacity) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-right text-muted-foreground">
                                        {w.available_capacity}m³ available of {w.total_capacity}m³
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <EmptyState title="No warehouses" description="Register your first facility to start managing inventory." />
                    )}
                </div>

                {/* Inventory Detail */}
                <div className="lg:col-span-2">
                    {selectedId ? (
                        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-border bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-[var(--brand-navy-900)] text-white flex items-center justify-center">
                                            <Boxes className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-foreground">{selectedWarehouse?.name}</h2>
                                            <p className="text-xs text-muted-foreground">Live Inventory Tracking</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="font-bold gap-2">
                                        <Plus className="h-3.5 w-3.5" /> Log Item
                                    </Button>
                                </div>
                            </div>

                            {loadingI ? (
                                <div className="p-6 space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                                </div>
                            ) : (inventory?.length ?? 0) > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4">Item (SKU)</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4 text-center">Qty</th>
                                                <th className="px-6 py-4 text-center">Unit Vol</th>
                                                <th className="px-6 py-4 text-right">Total Vol</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {inventory?.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-foreground">{item.name}</div>
                                                        <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-foreground">
                                                        {item.customer?.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-muted-foreground">
                                                        {item.volume_per_unit}m³
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-navy-900">
                                                        {(item.quantity * item.volume_per_unit).toFixed(2)}m³
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState title="Warehouse is empty" description="No inventory items currently stored in this facility." className="py-20" />
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                                <BarChart3 className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Select a facility</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mt-1">
                                Choose one of your warehouses from the list to view detailed inventory and capacity metrics.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
