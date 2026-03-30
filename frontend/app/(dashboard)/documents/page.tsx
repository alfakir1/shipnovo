'use client';

import React, { useState, useRef, useMemo } from 'react';
import { FileText, Download, Filter, Search, Plus, Calendar, X, UploadCloud, Shield, CheckCircle2, AlertCircle, Clock, Link2, User as UserIcon, Trash2 } from "lucide-react";
import { useDocuments, useUploadDocument, useDeleteDocument, ShipmentDocument, useShipments } from "@/hooks/useShipments";
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DocumentManagementPage() {
    const { t } = useI18n();
    const { user } = useAuth();
    const { data: rawDocs, isLoading } = useDocuments();
    const uploadDoc = useUploadDocument();
    const deleteDoc = useDeleteDocument();
    
    // For dropdowns in modal
    const { data: rawShipments } = useShipments();
    const allShipments = Array.isArray(rawShipments) ? rawShipments : (rawShipments?.data ?? []);
    
    // Role-based shipment filtering for the upload modal
    const availableShipments = useMemo(() => {
        if (!user) return [];
        // The API already filters shipments for Customers and Partners correctly.
        // For Admin/Ops, it returns everything, which is also correct.
        return allShipments;
    }, [allShipments, user]);

    const rawAllDocs = Array.isArray(rawDocs) ? rawDocs : (rawDocs?.data ?? []);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    
    // Upload Form State
    const [isPersonal, setIsPersonal] = useState(false);
    const [uploadForm, setUploadForm] = useState({ shipment_id: '', doc_type: 'customs', name: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // RBAC Filtering for Documents List
    const filteredDocs = useMemo(() => {
        let docs = [...rawAllDocs];

        // 1. Role-based visibility
        // reinforce client-side if needed

        // 2. Category Filter
        if (activeCategory !== 'all') {
            docs = docs.filter(d => 
                d.type === activeCategory || 
                d.doc_type === activeCategory || 
                (activeCategory === 'personal' && !d.shipment_id)
            );
        }

        // 3. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            docs = docs.filter(d => 
                d.name?.toLowerCase().includes(q) || 
                d.shipment_id?.toString().includes(q) ||
                d.type?.toLowerCase().includes(q) ||
                d.doc_type?.toLowerCase().includes(q)
            );
        }

        return docs;
    }, [rawAllDocs, activeCategory, searchQuery, user]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;
        if (!isPersonal && !uploadForm.shipment_id) return;
        
        try {
            await uploadDoc.mutateAsync({
                shipmentId: isPersonal ? 0 : uploadForm.shipment_id,
                file: selectedFile,
                type: uploadForm.doc_type,
                name: uploadForm.name || undefined
            });
            setIsUploadOpen(false);
            setSelectedFile(null);
            setIsPersonal(false);
            setUploadForm({ shipment_id: '', doc_type: 'customs', name: '' });
        } catch (err) {
            console.error('Upload failed', err);
        }
    };

    const categories = [
        { id: 'all', label: t('common.all') },
        { id: 'bol', label: t('documents.bol') },
        { id: 'customs', label: t('documents.customs') },
        { id: 'invoice', label: t('documents.invoice') },
        { id: 'insurance', label: t('documents.insurance') },
        { id: 'personal', label: t('documents.personalDocLabel') }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="h-12 w-12 border-4 border-brand-navy-200 border-t-brand-navy-600 rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-10 pb-20">
            {/* Header Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-navy-600/20 to-brand-blue-600/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border/50 shadow-2xl shadow-brand-navy-500/5">
                    <div>
                        <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
                            <div className="h-2 w-12 bg-brand-navy-600 rounded-full"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy-600/50">Compliance System v2.0</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase">
                           {t('documents.title')}
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium max-w-xl">
                            {t('documents.subtitle')}
                        </p>
                        {(user?.role === 'customer' || user?.role === 'partner') && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 bg-brand-navy-50 dark:bg-brand-navy-900/30 text-brand-navy-600 rounded-full border border-brand-navy-100 dark:border-brand-navy-800">
                                <Shield className="h-3 w-3 mr-2 rtl:ml-2" />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{t('documents.customerLimit')}</span>
                            </div>
                        )}
                    </div>
                    
                    {(user?.role === 'admin' || user?.role === 'ops' || user?.role === 'customer' || user?.role === 'partner') && (
                        <button 
                            onClick={() => setIsUploadOpen(true)}
                            className="group relative inline-flex items-center justify-center px-8 py-4 font-black uppercase tracking-[0.2em] text-background bg-foreground rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-foreground/10 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-600 to-brand-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Plus className="relative h-5 w-5 mr-3 rtl:ml-3 shrink-0" /> 
                            <span className="relative">{t('documents.newUpload')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* toolbar Section */}
            <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative w-full lg:flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-brand-navy-500 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID, name, or type..."
                        className="w-full pl-16 pr-8 py-5 bg-card/40 backdrop-blur-md border border-border focus:border-brand-navy-500 rounded-3xl shadow-sm focus:ring-4 focus:ring-brand-navy-500/5 transition-all text-sm font-medium"
                    />
                </div>
                
                <div className="flex items-center p-1.5 bg-card/60 backdrop-blur-md border border-border rounded-[2rem] shadow-sm overflow-x-auto no-scrollbar max-w-full">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-shrink-0 px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activeCategory === cat.id 
                                ? 'bg-foreground text-background shadow-lg' 
                                : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredDocs.map((doc: ShipmentDocument, i: number) => (
                    <div 
                        key={i} 
                        className="group relative bg-card rounded-[2.5rem] border border-border/50 shadow-sm p-1 hover:shadow-2xl hover:shadow-brand-navy-500/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        <div className="bg-gradient-to-br from-background to-muted/30 rounded-[2.2rem] p-8 h-full flex flex-col border border-border/20">
                            <div className="flex justify-between items-start mb-8">
                                <div className="h-16 w-16 rounded-3xl bg-card border border-border shadow-inner flex items-center justify-center text-muted-foreground/30 group-hover:scale-110 group-hover:bg-brand-navy-600 group-hover:text-white transition-all duration-500">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                    {doc.file_url ? (
                                        <button 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = doc.file_url!;
                                                link.target = '_blank';
                                                link.download = doc.name || 'document';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="p-3 bg-muted/50 hover:bg-brand-navy-500 hover:text-white rounded-2xl transition-all shadow-sm"
                                            title={t('common.download')}
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                    ) : (
                                        <button 
                                            className="p-3 bg-muted/50 text-muted-foreground rounded-2xl opacity-50 cursor-not-allowed"
                                            title="No file available"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                    )}

                                    {user?.role === 'admin' && (
                                        <button 
                                            onClick={() => {
                                                if(confirm(t('common.confirmDelete') || 'Are you sure you want to delete this document?')) {
                                                    deleteDoc.mutate(doc.id);
                                                }
                                            }}
                                            disabled={deleteDoc.isPending}
                                            className="p-3 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm shrink-0"
                                            title={t('common.delete') || 'Delete'}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}

                                </div>{/* end buttons flex */}
                            </div>{/* end flex justify-between */}

                            <div className="space-y-6 flex-1">
                                <div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                                        <span className="text-[10px] font-black px-2.5 py-1 bg-brand-navy-50 dark:bg-brand-navy-900/40 text-brand-navy-600 rounded-lg uppercase tracking-widest">
                                            {t(`documents.${doc.doc_type || doc.type}`) || doc.doc_type || doc.type}
                                        </span>
                                        {!doc.shipment_id && (
                                            <span className="text-[10px] font-black px-2.5 py-1 bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-600 rounded-lg uppercase tracking-widest">
                                                {t('documents.personalDocLabel')}
                                            </span>
                                        )}
                                        <span className="h-1 w-1 bg-muted-foreground/30 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">#{doc.id}</span>
                                    </div>
                                    <h4 className="text-xl font-black tracking-tight leading-tight group-hover:text-brand-navy-600 transition-colors line-clamp-2">{doc.name || 'Compliance Document'}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/50">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('common.uploaded')}</p>
                                        <p className="text-xs font-bold text-foreground flex items-center">
                                            <Calendar className="h-3 w-3 mr-2 rtl:ml-2 text-brand-navy-500" /> 
                                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('common.status')}</p>
                                        <div className="flex items-center text-brand-green-600 font-bold text-xs">
                                            <CheckCircle2 className="h-3 w-3 mr-2 rtl:ml-2" />
                                            {t('documents.verified')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                                    <span>{doc.shipment_id ? t('documents.linkToShipment') : t('documents.personalDocLabel')}</span>
                                    <span className="text-foreground">{doc.shipment_id ? `#${doc.shipment_id}` : '—'}</span>
                                </div>
                                <Button 
                                    onClick={() => doc.file_url ? window.open(doc.file_url, '_blank') : null}
                                    variant="outline" 
                                    className="w-full rounded-2xl border-2 border-border/50 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-foreground hover:text-background hover:border-foreground transition-all h-12"
                                    disabled={!doc.file_url}
                                >
                                    {t('documents.view')}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredDocs.length === 0 && (
                    <div className="col-span-full p-20 bg-card/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                        <div className="h-32 w-32 bg-background rounded-[2.5rem] shadow-2xl flex items-center justify-center text-muted-foreground/10 mb-8 border border-border">
                            <FileText className="h-16 w-16" />
                        </div>
                        <h3 className="text-3xl font-black text-foreground mb-3 tracking-tighter uppercase">{t('documents.emptyTitle')}</h3>
                        <p className="text-muted-foreground text-base max-w-md font-medium leading-relaxed">{t('documents.emptyDesc')}</p>
                        <Button 
                            variant="link" 
                            className="mt-6 text-brand-navy-600 font-black uppercase tracking-widest text-xs"
                            onClick={() => setSearchQuery('')}
                        >
                            Reset Search
                        </Button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsUploadOpen(false)}></div>
                    <div className="relative bg-card w-full max-w-xl rounded-[3rem] border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] p-1 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-8 text-start">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{t('documents.newUpload')}</h3>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">{t('documents.uploadDesc')}</p>
                                </div>
                                <button 
                                    onClick={() => setIsUploadOpen(false)} 
                                    className="h-10 w-10 flex items-center justify-center bg-muted/50 hover:bg-muted rounded-xl transition-colors shrink-0 outline-none"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                                
                            <form onSubmit={handleUpload} className="space-y-8 text-start">
                                {/* Upload Type Toggle */}
                                <div className="flex p-1.5 bg-muted/50 rounded-2xl mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsPersonal(false)}
                                        className={`flex-1 flex items-center justify-center py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isPersonal ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Link2 className="h-4 w-4 mr-2 rtl:ml-2" /> {t('documents.linkToShipmentLabel')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPersonal(true)}
                                        className={`flex-1 flex items-center justify-center py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isPersonal ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <UserIcon className="h-4 w-4 mr-2 rtl:ml-2" /> {t('documents.personalDocLabel')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {!isPersonal && (
                                        <div className="space-y-2 text-start">
                                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">{t('common.shipments') || 'Shipment'}</label>
                                            <div className="relative">
                                                <select 
                                                    required={!isPersonal}
                                                    value={uploadForm.shipment_id} 
                                                    onChange={e => setUploadForm(prev => ({...prev, shipment_id: e.target.value}))}
                                                    className="w-full h-14 px-5 rounded-2xl border-2 border-border bg-transparent focus:ring-4 focus:ring-brand-navy-500/5 focus:border-brand-navy-500 transition-all font-bold text-sm appearance-none outline-none text-start"
                                                >
                                                    <option value="">{t('documents.selectShipment')}</option>
                                                    {availableShipments.map((s: any) => (
                                                        <option key={s.id} value={s.id}>{s.tracking_number} • {s.origin} → {s.destination}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute top-1/2 right-5 rtl:left-5 rtl:right-auto -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className={`space-y-2 text-start ${isPersonal ? 'col-span-2' : ''}`}>
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">{t('documents.docType')}</label>
                                        <div className="relative">
                                            <select 
                                                required 
                                                value={uploadForm.doc_type} 
                                                onChange={e => setUploadForm(prev => ({...prev, doc_type: e.target.value}))}
                                                className="w-full h-14 px-5 rounded-2xl border-2 border-border bg-transparent focus:ring-4 focus:ring-brand-navy-500/5 focus:border-brand-navy-500 transition-all font-bold text-sm appearance-none outline-none text-start"
                                            >
                                                {isPersonal ? (
                                                    <>
                                                        <option value="partner_license">{t('documents.partner_license')}</option>
                                                        <option value="id_doc">{t('documents.id_doc')}</option>
                                                        <option value="insurance_policy">{t('documents.insurance')}</option>
                                                        <option value="profile_doc">{t('documents.profile_doc')}</option>
                                                        <option value="other">{t('documents.other')}</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="shipment_doc">{t('documents.other')}</option>
                                                        <option value="bill_of_lading">{t('documents.bol')}</option>
                                                        <option value="execution_doc">{t('documents.customs')}</option>
                                                        <option value="invoice">{t('documents.invoice')}</option>
                                                        <option value="pod">{t('documents.pod')}</option>
                                                    </>
                                                )}
                                            </select>
                                            <div className="absolute top-1/2 right-5 rtl:left-5 rtl:right-auto -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-start">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">{t('documents.customName')}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t('documents.docType')}
                                        value={uploadForm.name}
                                        onChange={e => setUploadForm(prev => ({...prev, name: e.target.value}))}
                                        className="w-full h-14 px-5 rounded-2xl border-2 border-border bg-transparent focus:ring-4 focus:ring-brand-navy-500/5 focus:border-brand-navy-500 transition-all font-bold text-sm outline-none text-start" 
                                    />
                                </div>

                                <div 
                                    className={`group relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer overflow-hidden ${
                                        selectedFile ? 'border-brand-navy-500 bg-brand-navy-50/50' : 'border-border hover:border-brand-navy-500 hover:bg-muted/30'
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="relative z-10">
                                        <div className={`h-20 w-20 mx-auto rounded-3xl flex items-center justify-center mb-4 transition-all duration-500 ${selectedFile ? 'bg-brand-navy-600 text-white' : 'bg-card text-muted-foreground group-hover:scale-110'}`}>
                                            {selectedFile ? <CheckCircle2 className="h-10 w-10" /> : <UploadCloud className="h-10 w-10" />}
                                        </div>
                                        <p className="text-base font-black text-foreground uppercase tracking-tight">
                                            {selectedFile ? selectedFile.name : t('documents.uploadClick')}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium mt-2">{t('documents.uploadHint')}</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full h-16 bg-foreground text-background font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale shadow-2xl shadow-foreground/20"
                                    disabled={uploadDoc.isPending || !selectedFile || (!isPersonal && !uploadForm.shipment_id)}
                                >
                                    {uploadDoc.isPending ? t('documents.uploading') : t('documents.newUpload')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
