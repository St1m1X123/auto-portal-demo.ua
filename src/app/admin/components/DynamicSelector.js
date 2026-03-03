"use client";

import React, { useState, useMemo } from 'react';

/**
 * Селектор з можливістю пошуку та створення нових значень
 * Використовується для Марок та Моделей
 */
export default function DynamicSelector({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Виберіть або введіть нове",
    multiple = false
}) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Фільтруємо існуючі опції за пошуком
    const filteredOptions = useMemo(() => {
        return options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    // Чи є введене значення новим?
    const isNew = search && !options.some(opt => opt.toLowerCase() === search.toLowerCase());

    const handleSelect = (val) => {
        if (multiple) {
            const current = Array.isArray(value) ? value : [];
            if (current.includes(val)) {
                onChange(current.filter(item => item !== val));
            } else {
                onChange([...current, val]);
            }
        } else {
            onChange(val);
            setIsOpen(false);
        }
        setSearch('');
    };

    const removeValue = (val) => {
        if (multiple) {
            onChange(value.filter(item => item !== val));
        } else {
            onChange(null);
        }
    };

    return (
        <div className="space-y-2 relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>

            {/* Вибрані значення */}
            <div className="flex flex-wrap gap-2 mb-2">
                {multiple && Array.isArray(value) && value.map(val => (
                    <span key={val} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                        {val}
                        <button type="button" onClick={() => removeValue(val)} className="hover:text-red-500 ml-1">×</button>
                    </span>
                ))}
                {!multiple && value && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 shadow-sm">
                        {value}
                        <button type="button" onClick={() => removeValue(value)} className="hover:text-red-500 ml-1">×</button>
                    </span>
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 text-slate-900 font-medium placeholder:text-slate-500 outline-none transition-all"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                />

                {isOpen && (search || filteredOptions.length > 0) && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto scrollbar-hide py-2">
                        {isNew && (
                            <button
                                type="button"
                                onClick={() => handleSelect(search)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-bold text-sm flex items-center gap-2 border-b border-slate-50 mb-1"
                            >
                                <span className="text-lg">➕</span> Додати нове: <span className="underline italic">"{search}"</span>
                            </button>
                        )}
                        {filteredOptions.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelect(opt)}
                                className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium ${(multiple ? value?.includes(opt) : value === opt) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}
