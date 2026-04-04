'use client';

import React, { useState } from 'react';
import { X, Truck, Plus, AlertCircle, Info } from 'lucide-react';
import { useCreateFleet } from '@/hooks/useShipments';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NewFleetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewFleetModal({ isOpen, onClose }: NewFleetModalProps) {
    const { t } = useI18n();
    const createFleet = useCreateFleet();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name) {
            setError('Please provide a fleet name');
            return;
        }

        try {
            await createFleet.mutateAsync({
                name,
                description
            });
            onClose();
            setName('');
            setDescription('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create fleet');
        }
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
                            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">{t('common.fleet.add_fleet_modal.title')}</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t('common.fleet.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 h-10 w-10 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-bold">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_fleet_modal.name')}</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Heavy Duty Transport"
                            className="h-12 rounded-xl focus:ring-brand-navy-600"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.fleet.add_fleet_modal.description')}</label>
                        <Textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Briefly describe the fleet's typical operations..."
                            className="min-h-[100px] rounded-xl focus:ring-brand-navy-600 resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">{t('common.cancel')}</Button>
                        <Button
                            type="submit"
                            disabled={createFleet.isPending}
                            className="flex-[2] h-12 bg-brand-navy-600 hover:bg-brand-navy-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-navy-500/20 shadow-brand-navy-600/30"
                        >
                            {createFleet.isPending ? t('common.loading') : <><Plus className="h-4 w-4 me-2" /> {t('common.fleet.add_fleet_modal.submit')}</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
