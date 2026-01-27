import React, { useState } from 'react';
import Link from 'next/link'; // <--- 1. Додали імпорт для посилань
import { subcategoriesData, dummyProducts } from '../utils/inventoryData';

export default function ProductGrid({ categoryName, globalSearchQuery, onBack, hideHeader = false }) {
    const [activeChip, setActiveChip] = useState('Всі');
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. СПОЧАТКУ РОЗРАХУНОК
    const isAllPartsMode = categoryName === 'Всі запчастини';
    const allChips = isAllPartsMode ? [] : (subcategoriesData[categoryName] || subcategoriesData['default']);
    const MAX_MOBILE_VISIBLE = 4;
    const hiddenCount = allChips.length - MAX_MOBILE_VISIBLE;

    const filteredProducts = dummyProducts.filter(p => {
        const categoryMatch = categoryName === 'Всі запчастини' || p.cat === categoryName;
        const subcatMatch = activeChip === 'Всі' || p.subcat === activeChip;
        const matchesSearch = !globalSearchQuery ||
            p.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            (p.oe && p.oe.toLowerCase().includes(globalSearchQuery.toLowerCase()));

        return categoryMatch && subcatMatch && matchesSearch;
    });

    // 2. ВИВЕДЕННЯ
    return (
        <section className="py-6 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Заголовок та кнопка "Назад" */}
                {!hideHeader && (
                    <div className="mb-6 flex items-center gap-4">
                        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                            Назад
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            {categoryName.toUpperCase()}
                        </h2>
                    </div>
                )}

                {/* Блок чіпсів */}
                {allChips.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                        {allChips.map((chip, index) => {
                            const isHiddenOnMobile = index >= MAX_MOBILE_VISIBLE && !isExpanded;
                            return (
                                <button
                                    key={chip}
                                    onClick={() => { setActiveChip(chip); setIsExpanded(false); }}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm active:scale-95 ${isHiddenOnMobile ? 'hidden md:inline-flex' : 'inline-flex'} ${activeChip === chip ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    {chip}
                                </button>
                            );
                        })}
                        {!isExpanded && hiddenCount > 0 && (
                            <button onClick={() => setIsExpanded(true)} className="md:hidden px-4 py-2 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95">
                                Ще {hiddenCount} ▼
                            </button>
                        )}
                        {isExpanded && hiddenCount > 0 && (
                            <button onClick={() => setIsExpanded(false)} className="md:hidden px-4 py-2 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95">
                                Згорнути ▲
                            </button>
                        )}
                    </div>
                )}

                {/* СПИСОК ТОВАРІВ */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Нічого не знайдено</p>
                        <p className="text-sm text-slate-500 mt-2">
                            За запитом <span className="text-blue-600 font-bold">"{globalSearchQuery}"</span> товарів немає. <br />
                            Спробуйте змінити запит або OE номер.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col group">
                                
                                {/* 2. ФОТО ТЕПЕР ПОСИЛАННЯ */}
                                <Link href={`/product/${product.id}`} className="block">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden cursor-pointer">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                                                {product.condition}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Інфо */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.subcat}</span>
                                    </div>

                                    {/* 3. НАЗВА ТЕПЕР ПОСИЛАННЯ */}
                                    <Link href={`/product/${product.id}`} className="block hover:text-blue-600 transition-colors">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2 min-h-[40px]">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">OE Номер:</p>
                                        <p className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase">
                                            {product.oe || 'не вказано'}
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex items-end justify-between mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Ціна</span>
                                                <span className="text-xl font-black text-slate-900 leading-none">{product.price}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* 4. КНОПКА "КУПИТИ" ТЕЖ ВЕДЕ НА ТОВАР */}
                                            <Link href={`/product/${product.id}`} className="flex-grow">
                                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md shadow-blue-100">
                                                    Купити
                                                </button>
                                            </Link>
                                            
                                            <button className="flex items-center justify-center w-11 h-11 border-2 border-green-500 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all active:scale-95" title="Написати у Viber">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.57 21a4.52 4.52 0 0 1-1.07-.13c-2.8-.73-5.5-2.65-7.7-5.54a14.7 14.7 0 0 1-3.2-6.1c-.26-1.12.06-2.22.88-3.04l.52-.52A2.3 2.3 0 0 1 8.54 5c.4 0 .78.15 1.07.44l2.12 2.12c.3.3.44.68.44 1.07s-.15.77-.44 1.07l-.65.65c.4.74.88 1.45 1.45 2.1a9.23 9.23 0 0 0 2.2 1.7l.6-.6c.3-.3.68-.44 1.07-.44s.77.15 1.07.44l2.12 2.12c.6.6.6 1.55 0 2.12l-.53.53a3.3 3.3 0 0 1-1.36.85z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}