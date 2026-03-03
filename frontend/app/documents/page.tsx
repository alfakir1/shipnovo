'use client';

import { FileText, Download, Filter, Search, Plus, Calendar } from "lucide-react";
import { useShipments, Shipment, ShipmentDocument } from "@/hooks/useShipments";

export default function DocumentManagementPage() {
    const { data } = useShipments();

    // Flattening documents for demo
    const allDocs = data?.data?.data?.flatMap((s: Shipment) => s.documents || []) || [];

    return (
        <div className="flex flex-col space-y-8 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Document Vault</h1>
                    <p className="text-slate-500 mt-1 font-sans font-medium italic">Centralized regulatory and logistics compliance repository.</p>
                </div>
                <button className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200">
                    <Plus className="h-4 w-4 mr-2" /> New Upload
                </button>
            </div>

            {/* Global Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search dossiers, BOLs, or certificates..."
                        className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                    />
                </div>
                <div className="flex space-x-2">
                    <button className="px-5 py-3 border border-slate-100 bg-white rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center">
                        <Filter className="h-4 w-4 mr-2" /> Filter By Type
                    </button>
                </div>
            </div>

            {/* Categories Bar */}
            <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar pb-2">
                {['All Archives', 'Bills of Lading', 'Customs Declarations', 'Commercial Invoices', 'Insurance Policies'].map((cat, i) => (
                    <button
                        key={cat}
                        className={`flex-shrink-0 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDocs.map((doc: ShipmentDocument, i: number) => (
                    <div key={i} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 group hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-300 border-l-4 border-l-slate-200 hover:border-l-indigo-600">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <FileText className="h-7 w-7" />
                            </div>
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><Download className="h-5 w-5" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-black tracking-tight leading-tight mb-2 truncate">{doc.name}</h4>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{doc.type}</p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uploaded</p>
                                    <p className="text-xs font-bold text-slate-900 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1 text-slate-300" /> Feb 25, 2024
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">
                            <span>Link to shipment</span>
                            <div className="mx-2 h-px flex-1 bg-slate-100 group-hover:bg-indigo-100"></div>
                            <span>view</span>
                        </div>
                    </div>
                ))}

                {allDocs.length === 0 && (
                    <div className="col-span-full p-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-100 mb-6">
                            <FileText className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Vault is Empty</h3>
                        <p className="text-slate-400 text-sm max-w-xs font-sans">No compliance documents have been archived for your shipments yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
