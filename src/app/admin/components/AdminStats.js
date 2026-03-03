import React, { useMemo, useState, useEffect } from 'react';
import { fetchAnalyticsData, cleanupOldSearchLogs } from '@/utils/supabase';
import { formatNumber } from '@/utils/format';

/**
 * Компонент статистики склада та аналітики сайту
 */
export default function AdminStats({ products = [], categories = [], onNav }) {
    const [analytics, setAnalytics] = useState({ topProducts: [], lastSearches: [], visits: [] });
    const [isAnaLoading, setIsAnaLoading] = useState(true);

    // 0. Завантаження аналітики та очищення
    useEffect(() => {
        async function loadAnalytics() {
            try {
                // Запускаємо очищення старих логів (Lazy Cleanup)
                cleanupOldSearchLogs();

                const data = await fetchAnalyticsData();
                if (data) setAnalytics(data);
            } catch (err) {
                console.error('Аналітика не завантажилася:', err);
            } finally {
                setIsAnaLoading(false);
            }
        }
        loadAnalytics();
    }, []);

    // 1. Розрахунок основних метрик
    const stats = useMemo(() => {
        const total = products.length;
        // Тільки активні товари для розрахунку цінності
        const activeProducts = products.filter(p => p.status === 'active');
        const activeCount = activeProducts.length;
        const totalValue = activeProducts.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);

        const inStock = products.filter(p => Number(p.quantity) > 0).length;
        const drafts = products.filter(p => p.status === 'draft').length;

        // Розподіл по брендах
        const brandMap = {};
        products.forEach(p => {
            const brand = p.car_brand || 'Інше';
            brandMap[brand] = (brandMap[brand] || 0) + 1;
        });

        const topBrands = Object.entries(brandMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6); // Топ 6 брендів

        // Товари, що закінчуються (активні, де к-сть <= 1)
        const lowStock = products
            .filter(p => p.status === 'active' && Number(p.quantity) <= 1)
            .slice(0, 5);

        return { total, totalValue, activeCount, inStock, drafts, topBrands, lowStock };
    }, [products]);

    // Картка метрики
    const StatCard = ({ title, value, subtext, icon, color, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all group ${onClick ? 'hover:border-blue-200 hover:shadow-md active:scale-[0.98]' : 'cursor-default'}`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
                    {subtext && <p className="text-[10px] font-bold text-slate-400 uppercase">{subtext}</p>}
                </div>
                <div className={`p-4 rounded-xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
            </div>
        </button>
    );

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Секція 1: Головні цифри */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Всього товарів"
                    value={stats.total}
                    subtext="База запчастин"
                    color="text-blue-600 bg-blue-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    onClick={() => onNav('products')}
                />
                <StatCard
                    title="Вартість складу"
                    value={`${formatNumber(stats.totalValue)} грн`}
                    subtext={`${stats.activeCount} акт. товарів`}
                    color="text-emerald-600 bg-emerald-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    onClick={() => onNav('products')}
                />
                <StatCard
                    title="В наявності"
                    value={stats.inStock}
                    subtext="К-сть > 0"
                    color="text-orange-600 bg-orange-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    onClick={() => onNav('products')}
                />
                <StatCard
                    title="Чернетки"
                    value={stats.drafts}
                    subtext="Потребують опису"
                    color="text-indigo-600 bg-indigo-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                />
            </div>

            {/* Секція 2: Аналітика інтересів */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* ТОП Товари за переглядами */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Популярні товари</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Лідери за переглядами</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isAnaLoading ? (
                            <div className="py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Завантаження...</div>
                        ) : analytics.topProducts.length > 0 ? (
                            analytics.topProducts.map((p, idx) => (
                                <div key={p.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-xs font-black text-slate-300 w-4">{idx + 1}</span>
                                        <div className="truncate">
                                            <p className="text-xs font-bold text-slate-800 truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors cursor-default">{p.name}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.sku}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 ml-4 shrink-0">
                                        <span className="text-[10px] font-bold text-slate-900">{p.views || 0}</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase">очей</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Немає даних</div>
                        )}
                    </div>
                </div>

                {/* Останні пошуки */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Що шукають</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Останні запити покупців</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isAnaLoading ? (
                            <div className="w-full py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Завантаження...</div>
                        ) : analytics.lastSearches.length > 0 ? (
                            analytics.lastSearches.map((s, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-100 hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-default">
                                    {s.query}
                                </span>
                            ))
                        ) : (
                            <div className="w-full py-10 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Пошуків поки не було</div>
                        )}
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Секція 3: Топ Бренди */}
                <div className="xl:col-span-1 bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
                    <div className="mb-6">
                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Склад за брендами</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Розподіл наявності</p>
                    </div>

                    <div className="space-y-4">
                        {stats.topBrands.map(([brand, count], index) => {
                            const percent = Math.round((count / stats.total) * 100);
                            return (
                                <div key={brand} className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{brand}</span>
                                        <span className="text-[9px] font-black text-blue-600">{count} шт.</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 bg-blue-600"
                                            style={{ width: `${percent}%`, transitionDelay: `${index * 50}ms` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Секція 4: Графік візитів (Спрощений) */}
                <div className="xl:col-span-1 bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Відвідуваність</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Візити за останні 14 днів</p>
                    </div>

                    <div className="flex-grow flex items-end justify-between gap-1 h-32 pt-2">
                        {isAnaLoading ? (
                            <div className="w-full py-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">...</div>
                        ) : analytics.visits.length > 0 ? (
                            analytics.visits.map((day, idx) => {
                                const maxHits = Math.max(...analytics.visits.map(v => v.hits), 1);
                                const height = (day.hits / maxHits) * 100;
                                return (
                                    <div key={idx} className="flex-grow flex flex-col items-center group relative h-full">
                                        <div className="absolute -top-6 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {day.hits} віз.
                                        </div>
                                        <div
                                            className="w-full bg-blue-100 group-hover:bg-blue-600 rounded-t-sm transition-all mt-auto"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        ></div>
                                        <span className="text-[7px] font-black text-slate-300 uppercase mt-2 rotate-45 origin-left">
                                            {new Date(day.visit_date).toLocaleDateString('uk', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full text-center text-[10px] font-bold text-slate-300 uppercase">Дані збираються</div>
                        )}
                    </div>
                </div>

                {/* Секція 5: Повідомлення про залишки */}
                <div className="xl:col-span-1 bg-slate-950 rounded-[1.5rem] p-6 text-white shadow-xl flex flex-col">
                    <div className="mb-6">
                        <h4 className="text-sm font-black uppercase tracking-tight">Залишки</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Мало в наявності</p>
                    </div>

                    <div className="space-y-3 flex-grow">
                        {stats.lowStock.length > 0 ? (
                            stats.lowStock.map(p => (
                                <div key={p.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                                    <div className="space-y-0.5 truncate">
                                        <p className="text-[11px] font-bold text-slate-100 truncate">{p.name}</p>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.sku}</p>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ml-2 shrink-0 ${p.quantity === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>
                                        {p.quantity} шт
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center opacity-30">
                                <p className="text-[9px] font-black uppercase tracking-widest">Проблем немає</p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => onNav('products')}
                        className="mt-6 w-full py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
                    >
                        Всі залишки
                    </button>
                </div>

            </div>

        </div>
    );
}
