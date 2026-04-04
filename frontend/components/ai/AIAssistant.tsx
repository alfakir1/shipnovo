'use client';

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    KeyboardEvent,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import {
    Bot,
    X,
    Send,
    Sparkles,
    Package,
    MapPin,
    DollarSign,
    RotateCcw,
    ChevronDown,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isError?: boolean;
}

interface QuickAction {
    labelKey: string;
    icon: React.ElementType;
    action: 'navigate' | 'message';
    target: string;        // path for navigate, message text for message
    messageKey?: string;   // pre-fill message for navigate type
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 9);

function formatMarkdown(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
        );
        return (
            <React.Fragment key={i}>
                {rendered}
                {i < lines.length - 1 && <br />}
            </React.Fragment>
        );
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 px-1">
            <div className="ai-typing-dots flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 ai-dot-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 ai-dot-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 ai-dot-3" />
            </div>
            <span className="text-xs opacity-60">{label}</span>
        </div>
    );
}

function MessageBubble({
    message,
    isRtl,
}: {
    message: Message;
    isRtl: boolean;
}) {
    const isUser = message.role === 'user';
    const isError = message.isError;

    return (
        <div
            className={cn(
                'flex gap-2.5 group',
                isUser ? (isRtl ? 'flex-row' : 'flex-row-reverse') : 'flex-row'
            )}
        >
            {/* Avatar */}
            {!isUser && (
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #08113A 0%, #223F76 100%)' }}>
                    <Bot className="w-3.5 h-3.5" />
                </div>
            )}

            {/* Bubble */}
            <div
                className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                    isUser
                        ? 'text-white rounded-tr-sm'
                        : isError
                            ? 'bg-orange-50 text-orange-700 border border-orange-200 rounded-tl-sm dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800'
                            : 'bg-card text-card-foreground border border-border rounded-tl-sm',
                    isRtl && isUser && 'rounded-tr-2xl rounded-tl-sm',
                )}
                style={isUser ? { background: 'linear-gradient(135deg, #08113A 0%, #223F76 100%)' } : {}}
            >
                {isError && (
                    <div className="flex items-center gap-1.5 mb-1 text-orange-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Error</span>
                    </div>
                )}
                <div>{formatMarkdown(message.content)}</div>
                <p className={cn(
                    'text-[10px] mt-1.5 opacity-50',
                    isUser ? 'text-white' : 'text-muted-foreground',
                    isRtl ? 'text-start' : (isUser ? 'text-end' : 'text-start')
                )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIAssistant() {
    const { t, locale, isRtl } = useI18n();
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [requestInFlight, setRequestInFlight] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Greeting on open ──────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: generateId(),
                    role: 'assistant',
                    content: t('ai.greeting'),
                    timestamp: new Date(),
                },
            ]);
        }
    }, [isOpen, messages.length, t]);

    // ── Reset greeting on locale change ──────────────────────────────────────
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([
                {
                    id: generateId(),
                    role: 'assistant',
                    content: t('ai.greeting'),
                    timestamp: new Date(),
                },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    // ── Scroll to bottom on new message ──────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // ── Focus input on open ───────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // ── Extract shipment ID from URL ──────────────────────────────────────────
    const getShipmentId = useCallback((): number | undefined => {
        const match = pathname?.match(/\/shipments?\/(\d+)/);
        return match ? parseInt(match[1]) : undefined;
    }, [pathname]);

    // ── Build page label ──────────────────────────────────────────────────────
    const getPageLabel = useCallback((): string => {
        if (!pathname) return 'dashboard';
        if (pathname.includes('shipment')) return 'shipments';
        if (pathname.includes('pricing'))  return 'pricing';
        if (pathname.includes('document')) return 'documents';
        if (pathname.includes('invoice'))  return 'invoices';
        if (pathname.includes('ticket'))   return 'tickets';
        if (pathname.includes('partner'))  return 'partner-portal';
        if (pathname.includes('ops'))      return 'operations';
        return 'dashboard';
    }, [pathname]);

    // ── Send message ──────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim().slice(0, 500);
        if (!trimmed || requestInFlight) return;

        // Add user message
        const userMsg: Message = {
            id: generateId(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setRequestInFlight(true);

        // Build history from last 5 messages (excluding greeting if sole message)
        const conversationHistory = messages
            .filter(m => !m.isError)
            .slice(-5)
            .map(m => ({ role: m.role, content: m.content }));

        const payload = {
            message: trimmed,
            locale,
            context: {
                page: getPageLabel(),
                shipment_id: getShipmentId(),
                user_role: user?.role ?? 'customer',
            },
            history: conversationHistory,
        };

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
            const token = typeof window !== 'undefined'
                ? localStorage.getItem('auth_token')
                : null;

            const response = await axios.post(
                `${backendUrl}/api/ai/chat`,
                payload,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    timeout: 25000,
                }
            );

            const reply = response.data?.data?.reply ?? response.data?.reply ?? '';
            setMessages(prev => [
                ...prev,
                {
                    id: generateId(),
                    role: 'assistant',
                    content: reply,
                    timestamp: new Date(),
                },
            ]);

            if (!isOpen) setHasNewMessage(true);
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    id: generateId(),
                    role: 'assistant',
                    content: t('ai.error'),
                    timestamp: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
            setRequestInFlight(false);
        }
    }, [requestInFlight, messages, locale, getPageLabel, getShipmentId, user?.role, isOpen, t]);

    // ── Debounced key handler ─────────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => sendMessage(input), 300);
        }
    };

    // ── Quick action handler ──────────────────────────────────────────────────
    const quickActions: QuickAction[] = [
        {
            labelKey: 'ai.quickActions.createShipment',
            icon: Package,
            action: 'navigate',
            target: '/customer/shipments/new',
        },
        {
            labelKey: 'ai.quickActions.trackShipment',
            icon: MapPin,
            action: 'message',
            target: locale === 'ar' ? 'أريد تتبع شحنتي' : 'I want to track my shipment',
        },
        {
            labelKey: 'ai.quickActions.viewPricing',
            icon: DollarSign,
            action: 'navigate',
            target: '/pricing',
        },
    ];

    const handleQuickAction = (action: QuickAction) => {
        if (action.action === 'navigate') {
            router.push(action.target);
            setIsOpen(false);
        } else {
            sendMessage(action.target);
        }
    };

    // ── Clear chat ────────────────────────────────────────────────────────────
    const clearChat = () => {
        setMessages([
            {
                id: generateId(),
                role: 'assistant',
                content: t('ai.greeting'),
                timestamp: new Date(),
            },
        ]);
    };

    const charCount = input.length;
    const overLimit = charCount > 500;
    const canSend = input.trim().length > 0 && !overLimit && !requestInFlight;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── CSS animations (injected once) ── */}
            <style>{`
                @keyframes ai-dot-bounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
                    40%           { transform: translateY(-4px); opacity: 1; }
                }
                .ai-dot-1 { animation: ai-dot-bounce 1.2s ease-in-out infinite; }
                .ai-dot-2 { animation: ai-dot-bounce 1.2s ease-in-out 0.2s infinite; }
                .ai-dot-3 { animation: ai-dot-bounce 1.2s ease-in-out 0.4s infinite; }

                @keyframes ai-panel-in {
                    from { opacity: 0; transform: translateY(16px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .ai-panel-enter { animation: ai-panel-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

                @keyframes ai-fab-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(247, 121, 9, 0.4); }
                    50%      { box-shadow: 0 0 0 10px rgba(247, 121, 9, 0); }
                }
                .ai-fab-pulse { animation: ai-fab-pulse 2.5s ease-in-out infinite; }

                @keyframes ai-badge-in {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }
                .ai-badge-in { animation: ai-badge-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>

            {/* ── Floating Action Button ───────────────────────────────────────── */}
            <button
                id="ai-assistant-fab"
                aria-label={t('ai.openChat')}
                onClick={() => {
                    setIsOpen(o => !o);
                    setHasNewMessage(false);
                }}
                className={cn(
                    'fixed bottom-6 z-[100] flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95',
                    isRtl ? 'left-6' : 'right-6'
                )}
                style={{ background: 'linear-gradient(135deg, #08113A 0%, #F77909 100%)' }}
            >
                <div className={cn('absolute inset-0 rounded-2xl', !isOpen && 'ai-fab-pulse')} />
                <div className="relative">
                    {isOpen
                        ? <ChevronDown className="w-6 h-6 text-white" />
                        : <Bot className="w-6 h-6 text-white" />}
                </div>

                {/* Unread indicator */}
                {hasNewMessage && !isOpen && (
                    <span className={cn(
                        'absolute -top-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center ai-badge-in',
                        isRtl ? '-left-1' : '-right-1'
                    )}>!</span>
                )}
            </button>

            {/* ── Chat Panel ──────────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    id="ai-assistant-panel"
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={cn(
                        'fixed bottom-24 z-[100] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden ai-panel-enter',
                        isRtl ? 'left-6' : 'right-6'
                    )}
                    style={{
                        background: 'var(--card)',
                        maxHeight: 'min(600px, calc(100vh - 7rem))',
                        fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif",
                    }}
                >
                    {/* ── Header ───────────────────────────────────────────── */}
                    <div
                        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #08113A 0%, #223F76 100%)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-tight">{t('ai.title')}</p>
                                <p className="text-[11px] text-white/50 leading-tight">{t('ai.subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearChat}
                                aria-label={t('ai.clearChat')}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                title={t('ai.clearChat')}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label={t('ai.closeChat')}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages ─────────────────────────────────────────── */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar"
                        style={{ minHeight: '240px' }}>

                        {messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} isRtl={isRtl} />
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #08113A 0%, #223F76 100%)' }}>
                                    <Bot className="w-3.5 h-3.5" />
                                </div>
                                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-muted-foreground">
                                    <TypingIndicator label={t('ai.typing')} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Quick Actions ─────────────────────────────────────── */}
                    {messages.length <= 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {quickActions.map((qa) => (
                                <button
                                    key={qa.labelKey}
                                    onClick={() => handleQuickAction(qa)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <qa.icon className="w-3 h-3" />
                                    {t(qa.labelKey)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Input ─────────────────────────────────────────────── */}
                    <div className="flex-shrink-0 border-t border-border px-3 pt-3 pb-3">
                        <div className={cn(
                            'flex items-end gap-2 rounded-xl border transition-colors',
                            overLimit ? 'border-destructive' : 'border-border focus-within:border-primary/50',
                            'bg-background px-3 py-2'
                        )}>
                            <textarea
                                ref={inputRef}
                                id="ai-chat-input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('ai.placeholder')}
                                rows={1}
                                maxLength={520}
                                disabled={isLoading}
                                className={cn(
                                    'flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed min-h-[20px] max-h-[80px]',
                                    isRtl ? 'text-right' : 'text-left'
                                )}
                                style={{ direction: isRtl ? 'rtl' : 'ltr' }}
                            />
                            <button
                                id="ai-send-btn"
                                onClick={() => sendMessage(input)}
                                disabled={!canSend}
                                aria-label={t('ai.send')}
                                className={cn(
                                    'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                                    canSend
                                        ? 'text-white hover:scale-105 active:scale-95'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                )}
                                style={canSend ? { background: 'linear-gradient(135deg, #08113A 0%, #F77909 100%)' } : {}}
                            >
                                {isLoading
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Send className={cn('w-3.5 h-3.5', isRtl && 'rtl-flip')} />}
                            </button>
                        </div>

                        {/* Char counter */}
                        <div className={cn(
                            'flex items-center justify-between mt-1.5 px-1',
                            isRtl ? 'flex-row-reverse' : 'flex-row'
                        )}>
                            <p className="text-[10px] text-muted-foreground/60">{t('ai.poweredBy')}</p>
                            <p className={cn(
                                'text-[10px] tabular-nums',
                                overLimit ? 'text-destructive font-semibold' : 'text-muted-foreground/60'
                            )}>
                                {charCount}/500
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
