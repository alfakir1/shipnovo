'use client';

import React, { useState } from 'react';
import { Bell, MessageSquare, Check, ChevronRight, RefreshCw, Star, Activity, Package, FileText, Truck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useI18n } from '@/components/providers/I18nProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { t } = useI18n();
    const router = useRouter();

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead(id);
    };

    const handleNotificationClick = (id: string, notif: any) => {
        markAsRead(id);
        setIsOpen(false);
        
        const type = notif.data.type;
        const shipmentId = notif.data.shipment_id;
        const ticketId = notif.data.ticket_id;

        if (type === 'system_operation' && shipmentId) {
            const rolePrefix = (user?.role === 'admin' || user?.role === 'ops') ? '/ops' : '/partner';
            router.push(`${rolePrefix}/shipments/${shipmentId}`);
        } else if (type === 'system_operation' && ticketId) {
            router.push(`/tickets/${ticketId}`);
        } else if (type === 'return_requested' || type === 'shipment_rated') {
            const rolePrefix = (user?.role === 'admin' || user?.role === 'ops') ? '/ops' : '/partner';
            const page = (user?.role === 'admin' || user?.role === 'ops') ? 'shipments' : 'jobs';
            router.push(`${rolePrefix}/${page}/${shipmentId}`);
        } else if (ticketId) {
            router.push(`/tickets/${ticketId}`);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-2.5 rounded-2xl transition-all relative group",
                    isOpen 
                        ? "bg-brand-navy-600 text-white shadow-xl shadow-brand-navy-500/20 scale-105" 
                        : "bg-muted/30 text-muted-foreground hover:bg-brand-navy-100 dark:hover:bg-brand-navy-900/40 hover:text-brand-navy-600 dark:hover:text-brand-navy-400"
                )}
            >
                <Bell className={cn("h-5 w-5", isOpen ? "animate-none" : "group-hover:animate-swing")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-xl scale-110">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={cn(
                        "absolute top-full mt-4 w-[340px] md:w-[400px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-8 duration-500",
                        "right-0 origin-top-right rtl:right-auto rtl:left-0 rtl:origin-top-left"
                    )}>
                        {/* Header */}
                        <div className="p-7 pb-5 flex items-center justify-between border-b border-border/30">
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-foreground uppercase">{t('notifications.title')}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-brand-navy-500 animate-pulse" />
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                                        {t('notifications.unreadUpdates', { count: unreadCount })}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => markAllAsRead()}
                                    className="px-4 py-2 rounded-xl bg-brand-navy-50 dark:bg-brand-navy-900/40 text-[10px] font-black uppercase tracking-widest text-brand-navy-600 hover:bg-brand-navy-600 hover:text-white transition-all transform active:scale-95"
                                >
                                    {t('notifications.markAllRead')}
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[480px] overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-center px-10 animate-in fade-in zoom-in duration-700 delay-150">
                                    <div className="h-24 w-24 rounded-[2.5rem] bg-brand-navy-50 dark:bg-brand-navy-900/20 border border-brand-navy-200/30 flex items-center justify-center text-brand-navy-400/40 mb-8 rotate-12 transition-transform hover:rotate-0 duration-700 shadow-inner">
                                        <Bell size={48} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-base font-black text-foreground uppercase tracking-[0.2em] mb-3">{t('notifications.emptyTitle')}</h4>
                                    <p className="text-xs text-muted-foreground font-medium italic leading-relaxed px-4">
                                        {t('notifications.emptyDesc')}
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notif: any) => {
                                    const type = notif.data.type;
                                    const isReturn = type === 'return_requested';
                                    const isRating = type === 'shipment_rated';
                                    const isSystem = type === 'system_operation';

                                    const icon = isReturn ? <RefreshCw className="h-6 w-6" /> : 
                                                 isRating ? <Star className="h-6 w-6 fill-brand-orange-500" /> :
                                                 isSystem ? <Activity className="h-6 w-6" /> :
                                                 <MessageSquare className="h-6 w-6" />;
                                    
                                    const accentColor = isReturn ? "text-destructive" :
                                                        isRating ? "text-brand-orange-500" :
                                                        isSystem ? "text-teal-600 dark:text-teal-400" :
                                                        "text-brand-navy-600 dark:text-brand-navy-400";
                                    
                                    const category = isReturn ? t('notifications.returnRequest') :
                                                     isRating ? t('notifications.newRating') :
                                                     isSystem ? t('notifications.systemUpdate') :
                                                     t('notifications.supportCase');

                                    const title = isReturn ? `${t('notifications.return')}: ${notif.data.tracking_number}` :
                                                  isRating ? `${t('notifications.rated')}: ${notif.data.tracking_number}` :
                                                  notif.data.subject;

                                    const content = isReturn ? notif.data.reason :
                                                    isRating ? `${notif.data.score} ${t('common.stars')} - ${notif.data.comment || notif.data.suggestions || ''}` :
                                                    notif.data.message_snippet;

                                    return (
                                        <div 
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif.id, notif)}
                                            className="relative p-5 bg-muted/10 hover:bg-muted/30 border border-transparent hover:border-border/50 rounded-3xl transition-all cursor-pointer group flex gap-5 overflow-hidden"
                                        >
                                            <div className={cn("h-12 w-12 shrink-0 rounded-2xl bg-white dark:bg-muted border border-border/50 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform", accentColor)}>
                                                {icon}
                                            </div>
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.15em]", accentColor)}>
                                                        {category}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-muted-foreground bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full border border-border/30">
                                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-black text-foreground mb-1 leading-tight group-hover:text-brand-navy-600 transition-colors">
                                                    {title}
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 italic leading-relaxed">
                                                    "{content}"
                                                </p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold ring-2 ring-background">
                                                        {(notif.data.customer_name?.[0] || notif.data.sender_name?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                                                        {t('notifications.by')} {notif.data.customer_name || notif.data.sender_name}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="self-start p-2 hover:bg-brand-navy-600 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-xl translate-x-4 group-hover:translate-x-0"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>

                                            <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-brand-navy-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-2">
                            <Link href="/tickets" onClick={() => setIsOpen(false)}>
                                <button className="w-full py-4 rounded-[1.5rem] bg-brand-navy-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-navy-500/30 hover:bg-brand-navy-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                    {t('notifications.viewDashboard')} <ChevronRight size={14} className="rtl-flip" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                @keyframes swing {
                    0% { transform: rotate(0deg); }
                    15% { transform: rotate(10deg); }
                    30% { transform: rotate(-10deg); }
                    45% { transform: rotate(5deg); }
                    60% { transform: rotate(-5deg); }
                    100% { transform: rotate(0deg); }
                }
                .group-hover\:animate-swing:hover {
                    animation: swing 0.8s ease-in-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--brand-navy-600-rgb), 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--brand-navy-600-rgb), 0.2);
                }
            `}</style>
        </div>
    );
}
