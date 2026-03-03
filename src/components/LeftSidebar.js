"use client";
import React, { useMemo } from 'react';
import { subcategoriesData } from '@/utils/inventoryData';

export default function LeftSidebar({
    // Дані
    allProducts = [],
    dbCategories = [],
    availableBrands = [],
    // Поточні значення фільтрів
    selectedBrand,
    selectedModel,
    selectedCategory,
    searchQuery,
    sortBy,
    priceRange,
    maxPrice,
    condition,        // 'all' | 'used' | 'new'
    partBrand,        // рядок (марка виробника)
    partType,         // тип запчастини (subcat)
    inStockOnly,      // boolean
    // Callbacks
    onBrandChange,
    onModelChange,
    onCategoryChange,
    onSearchChange,
    onSortChange,
    onPriceChange,
    onConditionChange,
    onPartBrandChange,
    onPartTypeChange,
    onInStockChange,
    onReset,
    onOpenVin,
    // UI
    isOpen,
    onToggle,
}) {
    // Динамічні моделі за обраним брендом
    const dynamicModels = useMemo(() => {
        if (!selectedBrand) return [];
        const modelsSet = new Set();
        allProducts
            .filter(p => (p.car_brand || 'OPEL').toUpperCase() === selectedBrand.toUpperCase())
            .forEach(p => {
                if (Array.isArray(p.compatible_models)) {
                    p.compatible_models.forEach(m => modelsSet.add(m));
                }
            });
        return Array.from(modelsSet).sort();
    }, [allProducts, selectedBrand]);

    // Категорії верхнього рівня
    const categoryNames = useMemo(() => {
        return dbCategories.filter(c => c.parent_id === null).map(c => c.name).sort();
    }, [dbCategories]);

    // Марки виробника (part_brand) з бази
    const partBrandOptions = useMemo(() => {
        const set = new Set(allProducts.map(p => p.part_brand).filter(Boolean));
        return Array.from(set).sort();
    }, [allProducts]);

    // Типи деталей (справжні підкатегорії з бази)
    const subcatOptions = useMemo(() => {
        if (!selectedCategory || !dbCategories) return [];

        // Знаходимо ID головної категорії
        const parentCat = dbCategories.find(c => c.name === selectedCategory && !c.parent_id);
        if (!parentCat) return [];

        // Повертаємо назви всіх підкатегорій, які належать цій головній
        return dbCategories
            .filter(c => c.parent_id === parentCat.id)
            .map(c => c.name)
            .sort();
    }, [dbCategories, selectedCategory]);

    const activeFiltersCount = [
        selectedBrand, selectedModel, selectedCategory,
        searchQuery, partBrand, partType,
        condition && condition !== 'all' ? condition : null,
        inStockOnly ? 'inStock' : null,
        priceRange?.min > 0 ? 'minPrice' : null,
        priceRange?.max < maxPrice ? 'maxPrice' : null,
    ].filter(Boolean).length;

    return (
        <>
            {/* ===== COLLAPSED STATE (тонка смужка) ===== */}
            {!isOpen && (
                <aside className="hidden md:flex flex-col items-center w-12 shrink-0 sticky top-[116px] h-[calc(100dvh-116px)] bg-white border-r border-slate-100 z-30 py-4 gap-3">
                    {/* Кнопка відкрити */}
                    <button
                        onClick={onToggle}
                        title="Відкрити фільтри"
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-400 flex items-center justify-center transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    {/* Іконки-підказки */}
                    {activeFiltersCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                            {activeFiltersCount}
                        </div>
                    )}
                    <div className="w-6 h-px bg-slate-100 my-1" />
                    <span title="Фільтри" className="text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                    </span>
                </aside>
            )}

            {/* ===== OPEN STATE (Desktop Sidebar / Mobile Drawer) ===== */}
            {isOpen && (
                <>
                    {/* Backdrop (Mobile only) */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] md:hidden animate-in fade-in duration-300"
                        onClick={onToggle}
                    />

                    <aside className={`
                        fixed md:sticky top-0 md:top-[116px] left-0 h-screen md:h-[calc(100dvh-116px)] 
                        w-[280px] md:w-[280px] bg-white border-r border-slate-100 z-[1000] md:z-30 
                        flex flex-col overflow-hidden transition-transform duration-300 ease-out
                        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}>

                        {/* --- HEADER --- */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-600 rounded-full" />
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Фільтри</span>
                                {activeFiltersCount > 0 && (
                                    <span className="text-[9px] font-black bg-blue-600 text-white rounded-full px-1.5 py-0.5">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onToggle}
                                title="Згорнути"
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" className="md:hidden" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" className="hidden md:block" />
                                </svg>
                            </button>
                        </div>

                        {/* --- CONTENT --- */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 pb-10 space-y-5">

                            {/* 2. МАРКА АВТО */}
                            <div>
                                <label className="sidebar-label">Марка авто</label>
                                <SidebarSelect
                                    value={selectedBrand || ''}
                                    options={availableBrands}
                                    placeholder="Всі марки"
                                    onChange={val => onBrandChange(val || null)}
                                />
                            </div>

                            {/* 3. МОДЕЛЬ */}
                            <div>
                                <label className="sidebar-label">Модель</label>
                                <SidebarSelect
                                    value={selectedModel || ''}
                                    options={dynamicModels}
                                    placeholder={selectedBrand ? 'Всі моделі' : 'Спочатку виберіть марку'}
                                    onChange={val => onModelChange(val || null)}
                                    disabled={!selectedBrand}
                                />
                            </div>

                            {/* 4. КАТЕГОРІЯ */}
                            <div>
                                <label className="sidebar-label">Категорія</label>
                                <SidebarSelect
                                    value={selectedCategory || ''}
                                    options={categoryNames}
                                    placeholder="Всі категорії"
                                    onChange={val => {
                                        onCategoryChange(val || null);
                                        // При зміні категорії скидаємо тип деталі
                                        onPartTypeChange(null);
                                    }}
                                />
                            </div>

                            {/* 5. ТИП ДЕТАЛІ (subcat) - Залежить від категорії */}
                            <div>
                                <label className="sidebar-label">Тип деталі</label>
                                <SidebarSelect
                                    value={partType || ''}
                                    options={subcatOptions}
                                    placeholder={selectedCategory ? 'Всі типи' : 'Спочатку виберіть категорію'}
                                    onChange={val => onPartTypeChange(val || null)}
                                    disabled={!selectedCategory || subcatOptions.length === 0}
                                />
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* 5. ЦІНА */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="sidebar-label mb-0">Ціна (грн)</label>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                        {priceRange?.min} — {priceRange?.max}
                                    </span>
                                </div>
                                <div className="px-1 mb-3">
                                    <div className="relative h-5 flex items-center">
                                        <div className="absolute left-0 right-0 h-1 bg-slate-100 rounded-full">
                                            <div
                                                className="absolute h-full bg-blue-600 rounded-full"
                                                style={{
                                                    left: `${((priceRange?.min || 0) / maxPrice) * 100}%`,
                                                    right: `${100 - ((priceRange?.max || maxPrice) / maxPrice) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <input
                                            type="range" min="0" max={maxPrice} step="100" value={priceRange?.min || 0}
                                            onChange={e => onPriceChange({ ...priceRange, min: Math.min(parseInt(e.target.value), priceRange?.max || maxPrice) })}
                                            className="absolute w-full appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                                        />
                                        <input
                                            type="range" min="0" max={maxPrice} step="100" value={priceRange?.max || maxPrice}
                                            onChange={e => onPriceChange({ ...priceRange, max: Math.max(parseInt(e.target.value), priceRange?.min || 0) })}
                                            className="absolute w-full appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number" value={priceRange?.min || 0}
                                        onChange={e => onPriceChange({ ...priceRange, min: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 focus:border-blue-400 outline-none transition-all"
                                        placeholder="Від"
                                    />
                                    <input
                                        type="number" value={priceRange?.max || maxPrice}
                                        onChange={e => onPriceChange({ ...priceRange, max: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 focus:border-blue-400 outline-none transition-all"
                                        placeholder="До"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* 6. СТАН (Новий фільтр) */}
                            <div>
                                <label className="sidebar-label">Стан деталі</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { id: 'all', label: 'Всі' },
                                        { id: 'used', label: 'Б/У' },
                                        { id: 'new', label: 'Нова' },
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => onConditionChange(opt.id)}
                                            className={`py-2 rounded-xl text-[10px] font-black transition-all border-2 ${condition === opt.id
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 7. МАРКА ВИРОБНИКА (Новий фільтр) */}
                            {partBrandOptions.length > 0 && (
                                <div>
                                    <label className="sidebar-label">Виробник деталі</label>
                                    <SidebarSelect
                                        value={partBrand || ''}
                                        options={partBrandOptions}
                                        placeholder="Всі виробники"
                                        onChange={val => onPartBrandChange(val || null)}
                                    />
                                </div>
                            )}

                            {/* 8. СОРТУВАННЯ */}
                            <div>
                                <label className="sidebar-label">Сортування</label>
                                <div className="space-y-1">
                                    {[
                                        { id: 'default', label: 'За замовчуванням' },
                                        { id: 'cheap', label: 'Спочатку дешевші' },
                                        { id: 'expensive', label: 'Спочатку дорожчі' },
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => onSortChange(opt.id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 ${sortBy === opt.id
                                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 9. ТІЛЬКИ В НАЯВНОСТІ (Новий фільтр) */}
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                <span className="text-[11px] font-bold text-slate-700">Тільки в наявності</span>
                                <button
                                    onClick={() => onInStockChange(!inStockOnly)}
                                    className={`w-10 h-5 rounded-full transition-all relative ${inStockOnly ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${inStockOnly ? 'left-5' : 'left-0.5'}`} />
                                </button>
                            </div>

                            {/* СКИНУТИ */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={onReset}
                                    className="w-full text-center text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest py-2 transition-colors"
                                >
                                    ✕ Скинути всі фільтри
                                </button>
                            )}
                        </div>

                        {/* --- БАНЕР ВНИЗУ (sticky) --- */}
                        <div className="shrink-0 p-4 border-t border-slate-100">
                            <button
                                onClick={onOpenVin}
                                className="w-full group flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl p-3.5 transition-all active:scale-95"
                            >
                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-sm shrink-0">
                                    📦
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-wide leading-none mb-0.5">Привеземо під замовлення</p>
                                    <p className="text-[9px] text-white/60 font-medium">Підберемо за 15 хвилин</p>
                                </div>
                                <svg className="w-4 h-4 ml-auto text-white/50 group-hover:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </aside>
                </>
            )}
        </>
    );
}

/* --- ВНУТРІШНІЙ КОМПОНЕНТ: ПРОСТИЙ SELECT --- */
function SidebarSelect({ value, options, placeholder, onChange, disabled }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-slate-300'}`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px', paddingRight: '30px' }}
        >
            <option value="">{placeholder}</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    );
}
