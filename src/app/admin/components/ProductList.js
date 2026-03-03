"use client";

import React, { useState, useMemo, useRef } from 'react';
import { formatNumber } from '@/utils/format';
import { exportToCSV, readCSVFile } from '@/utils/csvUtils';

/**
 * Список товарів з компактними картками та фільтрами
 */
export default function ProductList({ products, onEdit, onDelete, onAdd, onBulkDelete, onBulkStatusChange, onBulkImport }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, draft
    const [brandFilter, setBrandFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set()); // Стан для вибраних товарів

    // Отримуємо унікальні бренди для фільтрації
    const brands = useMemo(() => {
        const b = new Set(products.map(p => p.car_brand).filter(Boolean));
        return ['all', ...Array.from(b).sort()];
    }, [products]);

    // Отримуємо унікальні категорії для фільтрації (з тих, що є в товарах)
    const activeCategories = useMemo(() => {
        const cats = new Map();
        products.forEach(p => {
            if (p.category) {
                cats.set(p.category.id, p.category.name);
            }
        });
        return Array.from(cats.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [products]);

    // Фільтрація
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                p.name?.toLowerCase().includes(searchLower) ||
                p.oe_number?.toLowerCase().includes(searchLower) ||
                p.category?.name?.toLowerCase().includes(searchLower) ||
                p.sku?.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchesBrand = brandFilter === 'all' || p.car_brand === brandFilter;
            const matchesCategory = categoryFilter === 'all' || p.category_id === parseInt(categoryFilter);

            return matchesSearch && matchesStatus && matchesBrand && matchesCategory;
        });
    }, [products, search, statusFilter, brandFilter, categoryFilter]);

    // Логіка вибору
    const toggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    // Масові дії
    const handleBulkAction = (action) => {
        const idsArray = Array.from(selectedIds);
        if (action === 'delete') {
            if (onBulkDelete) {
                onBulkDelete(idsArray);
                setSelectedIds(new Set());
            }
        } else {
            if (onBulkStatusChange) {
                onBulkStatusChange(idsArray, action); // action = 'active' або 'draft'
                setSelectedIds(new Set());
            }
        }
    };

    const fileInputRef = useRef(null);

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const parsedData = await readCSVFile(file);
            if (parsedData.length > 0 && onBulkImport) {
                onBulkImport(parsedData);
            } else {
                alert('Файл порожній або має невірний формат.');
            }
        } catch (err) {
            alert('Помилка імпорту: ' + err.message);
        }

        // Reset input
        e.target.value = '';
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24 lg:pb-6">
            {/* ФІЛЬТРИ ТА ПОШУК */}
            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Пошук (назва, OE, категорія)..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <span className="absolute left-3 top-3.5 text-blue-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                        {/* Прихований інпут для файлу */}
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImportFile}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                            title="Імпорт з CSV"
                        >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            CSV
                        </button>
                        <button
                            onClick={() => exportToCSV(filteredProducts)}
                            className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                            title="Експорт в Excel/CSV"
                        >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            CSV
                        </button>
                        <button
                            onClick={onAdd}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Додати товар
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                    {/* Статус-фільтри (Чіпси) */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[
                            { id: 'all', label: 'Всі' },
                            { id: 'active', label: 'Активні' },
                            { id: 'draft', label: 'Чернетки' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${statusFilter === f.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Бренд-фільтр */}
                    <select
                        className="bg-slate-100 px-3 py-2 rounded-xl font-bold text-slate-600 border-none focus:ring-2 ring-blue-500/20 outline-none"
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                    >
                        <option value="all">Всі бренди</option>
                        {brands.filter(b => b !== 'all').map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    {/* Категорія-фільтр */}
                    <select
                        className="bg-slate-100 px-3 py-2 rounded-xl font-bold text-slate-600 border-none focus:ring-2 ring-blue-500/20 outline-none"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Всі категорії</option>
                        {activeCategories.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>

                    {(search || statusFilter !== 'all' || brandFilter !== 'all' || categoryFilter !== 'all') && (
                        <button
                            onClick={() => { setSearch(''); setStatusFilter('all'); setBrandFilter('all'); setCategoryFilter('all'); }}
                            className="text-red-500 font-bold px-2 hover:underline"
                        >
                            Скинути
                        </button>
                    )}
                </div>
            </div>

            {/* СПИСОК ТОВАРІВ (КОМПАКТНИЙ) */}
            <div className="flex justify-between items-center px-2">
                <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                    <div className={`w - 5 h - 5 rounded border flex items - center justify - center transition - all ${selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? 'bg-blue-600 border-blue-600 shadow-inner' : 'bg-white border-slate-300'
                        } `}>
                        {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? 'Зняти виділення' : 'Вибрати всі'}
                </button>
                <div className="text-xs font-bold text-slate-400">
                    Знайдено: {filteredProducts.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className={`bg-white rounded-2xl border transition-all flex h-24 overflow-hidden group cursor-pointer ${selectedIds.has(product.id) ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-100 shadow-sm hover:shadow-md'
                            }`}
                        onClick={(e) => {
                            // Не виділяємо, якщо клікнули по кнопкам редагування/видалення
                            if (e.target.closest('button')) return;
                            toggleSelect(product.id);
                        }}
                    >
                        {/* Зона Чекбокса (тільки для візуалу, клік працює на всій картці) */}
                        <div className={`w-10 flex items-center justify-center border-r transition-colors ${selectedIds.has(product.id) ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 group-hover:bg-slate-100'
                            }`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.has(product.id) ? 'bg-blue-600 border-blue-600 shadow-inner' : 'bg-white border-slate-300'
                                }`}>
                                {selectedIds.has(product.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        </div>

                        {/* Фото зліва (фіксований квадрат) */}
                        <div className="w-20 md:w-24 h-24 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                            <img
                                src={product.main_image || product.images?.[0] || 'https://via.placeholder.com/150'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.status !== 'active' && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <span className="text-[8px] font-black uppercase bg-slate-800 text-white px-1.5 py-0.5 rounded shadow">Чернетка</span>
                                </div>
                            )}
                        </div>

                        {/* Контент справа */}
                        <div className="flex-grow p-3 flex flex-col justify-between min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                                        {product.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 truncate">{product.category?.name || 'Без категорії'}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => onEdit(product)} className="p-1.5 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-lg transition-all" title="Редагувати">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => onDelete(product)} className="p-1.5 bg-slate-50 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Видалити">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-bold text-blue-600">{formatNumber(product.price)} грн</div>
                                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.quantity} шт
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{product.car_brand} • {product.compatible_models?.[0] || 'Всі моделі'}</div>
                                </div>
                                <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-right">SKU: <br />{product.sku || product.id}</div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-blue-50 p-6 rounded-full">
                            <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Нічого не знайдено</p>
                    <button onClick={() => { setSearch(''); setStatusFilter('all'); setBrandFilter('all'); setCategoryFilter('all'); }} className="text-blue-600 font-bold text-xs underline">Скинути всі фільтри</button>
                </div>
            )}

            {/* ПАНЕЛЬ МАСОВИХ ДІЙ (Floating) */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-inner">
                            {selectedIds.size}
                        </div>
                        <span className="text-xs font-bold tracking-wider hidden md:inline">вибрано</span>
                    </div>

                    <div className="w-px h-8 bg-slate-700 hidden md:block"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('active')}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">Опублікувати</span>
                        </button>
                        <button
                            onClick={() => handleBulkAction('draft')}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">В чернетки</span>
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Видалити</span>
                        </button>
                    </div>

                    <button onClick={() => setSelectedIds(new Set())} className="ml-4 text-slate-400 hover:text-white opacity-50 hover:opacity-100 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
