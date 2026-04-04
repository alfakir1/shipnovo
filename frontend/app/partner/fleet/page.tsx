'use client';

import { useFleets, useFleetVehicles, useDrivers } from "@/hooks/useShipments";
import { useI18n } from "@/components/providers/I18nProvider";
import { Truck, Users, Plus, Gauge, ShieldCheck, Info, UserCheck } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewFleetModal } from "@/components/partner/NewFleetModal";
import { AddVehicleModal } from "@/components/partner/AddVehicleModal";

export default function PartnerFleetPage() {
    const { t } = useI18n();
    const { data: fleets, isLoading: loadingFleets } = useFleets();
    const [selectedFleetId, setSelectedFleetId] = useState<number | null>(null);
    const { data: vehicles, isLoading: loadingVehicles } = useFleetVehicles(selectedFleetId);
    const { data: drivers, isLoading: loadingDrivers } = useDrivers();

    const [isNewFleetModalOpen, setIsNewFleetModalOpen] = useState(false);
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("vehicles");

    // Calculate selected fleet stats
    const totalVehicles = vehicles?.length ?? 0;
    const activeVehicles = vehicles?.filter((v: { status: string }) => v.status === 'in_transit').length ?? 0;
    const availableVehicles = vehicles?.filter((v: { status: string }) => v.status === 'available').length ?? 0;
    const availabilityRate = totalVehicles ? Math.round((availableVehicles / totalVehicles) * 100) : 0;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">{t('common.fleet.title')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('common.fleet.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setActiveTab("drivers")} variant="outline" className="font-bold gap-2">
                        <Users className="h-4 w-4" /> {t('common.fleet.manage_drivers')}
                    </Button>
                    <Button onClick={() => setIsNewFleetModalOpen(true)} className="font-bold gap-2 bg-brand-navy-600 hover:bg-brand-navy-700 text-white">
                        <Plus className="h-4 w-4" /> {t('common.fleet.new_fleet')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Fleet Selector Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t('common.fleet.my_fleets')}</h2>
                    {loadingFleets ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
                    ) : fleets?.length > 0 ? (
                        fleets.map((f: { id: number; name: string; vehicles_count: number; description?: string }) => (
                            <button
                                key={f.id}
                                onClick={() => setSelectedFleetId(f.id)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group",
                                    selectedFleetId === f.id
                                        ? "border-brand-navy-600 bg-brand-navy-50/50"
                                        : "border-border bg-card"
                                )}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-foreground truncate mr-2">{f.name}</h3>
                                    <Badge variant="outline" className="text-[10px]">{t('common.fleet.vehicles_count', { count: f.vehicles_count })}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{f.description ?? t('common.fleet.no_description')}</p>
                            </button>
                        ))
                    ) : (
                        <EmptyState title={t('common.fleet.no_fleets')} description={t('common.fleet.no_fleets_desc')} className="py-12" />
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {selectedFleetId ? (
                        <div className="space-y-6">
                            {/* Fleet Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center">
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('common.fleet.stats.total_vehicles')}</span>
                                    </div>
                                    <p className="text-2xl font-black text-foreground">{totalVehicles}</p>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center">
                                            <Gauge className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('common.fleet.stats.active_today')}</span>
                                    </div>
                                    <p className="text-2xl font-black text-foreground">{activeVehicles}</p>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-brand-orange-50 dark:bg-brand-orange-900/40 text-brand-orange-600 dark:text-brand-orange-400 flex items-center justify-center">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('common.fleet.stats.availability')}</span>
                                    </div>
                                    <p className="text-2xl font-black text-foreground">{availabilityRate}%</p>
                                </div>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-muted p-1 rounded-xl">
                                    <TabsTrigger value="vehicles" className="rounded-lg font-bold">{t('common.fleet.tabs.vehicles')}</TabsTrigger>
                                    <TabsTrigger value="drivers" className="rounded-lg font-bold">{t('common.fleet.tabs.drivers')}</TabsTrigger>
                                </TabsList>

                                <TabsContent value="vehicles" className="mt-6">
                                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                        <div className="p-4 border-b border-border flex items-center justify-between">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t('common.fleet.inventory.title')}</h3>
                                            <Button onClick={() => setIsAddVehicleModalOpen(true)} size="sm" className="font-bold gap-2 bg-brand-navy-600 hover:bg-brand-navy-700 text-white">
                                                <Plus className="h-3.5 w-3.5" /> {t('common.fleet.inventory.add_vehicle')}
                                            </Button>
                                        </div>

                                        {loadingVehicles ? (
                                            <div className="p-6 space-y-4">
                                                <Skeleton className="h-12 w-full" />
                                                <Skeleton className="h-12 w-full" />
                                            </div>
                                        ) : vehicles?.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted/30 border-b border-border text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                                        <tr>
                                                            <th className="px-6 py-4 text-center">{t('common.fleet.inventory.plate')}</th>
                                                            <th className="px-6 py-4">{t('common.fleet.inventory.model_type')}</th>
                                                            <th className="px-6 py-4 text-center">{t('common.fleet.inventory.capacity')}</th>
                                                            <th className="px-6 py-4">{t('common.fleet.inventory.status')}</th>
                                                            <th className="px-6 py-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {vehicles.map((v: { id: number; plate_number: string; make: string; model: string; type: string; capacity_weight: number; capacity_volume: number; status: string }) => (
                                                            <tr key={v.id} className="hover:bg-muted/10">
                                                                <td className="px-6 py-4 font-mono font-bold text-brand-navy-900 text-center">
                                                                    <span className="px-2 py-1 bg-muted rounded border border-border">{v.plate_number}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="font-bold text-foreground">{v.make} {v.model}</div>
                                                                    <div className="text-xs text-muted-foreground capitalize">{v.type}</div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <div className="font-bold text-foreground">{v.capacity_weight}kg</div>
                                                                    <div className="text-[10px] text-muted-foreground uppercase">{v.capacity_volume}m³ Volume</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant={
                                                                        v.status === 'available' ? 'success' :
                                                                            v.status === 'in_transit' ? 'default' : 'warning'
                                                                    } className="capitalize">
                                                                        {v.status.replace('_', ' ')}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <Button variant="ghost" size="sm">
                                                                        <Info className="h-4 w-4" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <EmptyState title={t('common.fleet.inventory.no_vehicles')} description={t('common.fleet.inventory.no_vehicles_desc')} className="py-20" />
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="drivers" className="mt-6">
                                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                        <div className="p-4 border-b border-border flex items-center justify-between">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t('common.fleet.tabs.drivers')}</h3>
                                            <Button variant="outline" size="sm" className="font-bold gap-2" disabled>
                                                <Plus className="h-3.5 w-3.5" /> Register Driver
                                            </Button>
                                        </div>

                                        {loadingDrivers ? (
                                            <div className="p-6 space-y-4">
                                                <Skeleton className="h-12 w-full" />
                                                <Skeleton className="h-12 w-full" />
                                            </div>
                                        ) : drivers?.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted/30 border-b border-border text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                                        <tr>
                                                            <th className="px-6 py-4">Driver Name</th>
                                                            <th className="px-6 py-4">Contact</th>
                                                            <th className="px-6 py-4">License</th>
                                                            <th className="px-6 py-4">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {drivers.map((d: any) => (
                                                            <tr key={d.id} className="hover:bg-muted/10">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-brand-navy-100 flex items-center justify-center text-brand-navy-600">
                                                                            <Users className="h-4 w-4" />
                                                                        </div>
                                                                        <span className="font-bold text-foreground">{d.user?.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-muted-foreground">{d.phone || d.user?.email}</td>
                                                                <td className="px-6 py-4">
                                                                    <div className="font-mono text-xs">{d.license_number}</div>
                                                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">{d.license_type}</div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="success" className="gap-1">
                                                                        <UserCheck className="h-3 w-3" /> Verified
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center space-y-4">
                                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                                    <Users className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">{t('common.fleet.drivers_coming_soon.title')}</h3>
                                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                                                        {t('common.fleet.drivers_coming_soon.desc')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-muted/20 text-center">
                            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground mb-6 shadow-sm">
                                <Truck className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{t('common.fleet.select_fleet.title')}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                {t('common.fleet.select_fleet.desc')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <NewFleetModal 
                isOpen={isNewFleetModalOpen} 
                onClose={() => setIsNewFleetModalOpen(false)} 
            />
            {selectedFleetId && (
                <AddVehicleModal 
                    isOpen={isAddVehicleModalOpen} 
                    onClose={() => setIsAddVehicleModalOpen(false)} 
                    fleetId={selectedFleetId}
                />
            )}
        </div>
    );
}
