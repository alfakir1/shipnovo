'use client';

import React, { useState } from 'react';
import { X, Truck, Plus, AlertCircle, Weight, Box, Tag } from 'lucide-react';
import { useAddVehicle } from '@/hooks/useShipments';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    fleetId: number;
}

export function AddVehicleModal({ isOpen, onClose, fleetId }: AddVehicleModalProps) {
    const { t } = useI18n();
    const addVehicle = useAddVehicle();

    const [formData, setFormData] = useState({
        plate_number: '',
        make: '',
        model: '',
        type: 'Trailer',
        capacity_weight: '',
        capacity_volume: ''
    });
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.plate_number || !formData.make || !formData.model || !formData.capacity_weight || !formData.capacity_volume) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await addVehicle.mutateAsync({
                fleetId,
                data: {
                    ...formData,
                    capacity_weight: parseFloat(formData.capacity_weight),
                    capacity_volume: parseFloat(formData.capacity_volume)
                }
            });
            onClose();
            setFormData({
                plate_number: '',
                make: '',
                model: '',
                type: 'Trailer',
                capacity_weight: '',
                capacity_volume: ''
            });
        } catch (err: any) {
            if (err.errors && Object.keys(err.errors).length > 0) {
                const firstErrorKey = Object.keys(err.errors)[0];
                setError(err.errors[firstErrorKey][0]);
            } else {
                setError(err.message || 'Failed to add vehicle');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-navy-600 flex items-center justify-center text-white">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">{t('common.fleet.add_vehicle_modal.title')}</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t('common.fleet.inventory.title')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 h-10 w-10 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-bold">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_vehicle_modal.plate')}</label>
                            <Input
                                name="plate_number"
                                value={formData.plate_number}
                                onChange={handleChange}
                                placeholder="ABC-1234"
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_vehicle_modal.type')}</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full h-11 px-4 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-600 outline-none transition-all"
                            >
                                <option value="Trailer">Trailer</option>
                                <option value="Van">Van</option>
                                <option value="Truck">Truck</option>
                                <option value="Refrigerated">Refrigerated</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_vehicle_modal.make')}</label>
                            <Input
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                placeholder="Mercedes"
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_vehicle_modal.model')}</label>
                            <Input
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="Actros"
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_vehicle_modal.weight')}</label>
                            <div className="relative">
                                <Weight className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="capacity_weight"
                                    type="number"
                                    value={formData.capacity_weight}
                                    onChange={handleChange}
                                    placeholder="25000"
                                    className="h-11 ps-10 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_vehicle_modal.volume')}</label>
                            <div className="relative">
                                <Box className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="capacity_volume"
                                    type="number"
                                    value={formData.capacity_volume}
                                    onChange={handleChange}
                                    placeholder="80"
                                    className="h-11 ps-10 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">{t('common.cancel')}</Button>
                        <Button
                            type="submit"
                            disabled={addVehicle.isPending}
                            className="flex-[2] h-12 bg-brand-navy-600 hover:bg-brand-navy-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-navy-500/20 shadow-brand-navy-600/30 font-bold"
                        >
                            {addVehicle.isPending ? t('common.loading') : <><Plus className="h-4 w-4 me-2" /> {t('common.fleet.add_vehicle_modal.submit')}</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
