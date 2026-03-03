"use client";

import React, { useState } from 'react';

/**
 * Керування категоріями (Справочник)
 * Дозволяє додавати та видаляти категорії в ієрархічному списку
 */
export default function CategoryManager({ categories, onAdd, onDelete }) {
    const [newName, setNewName] = useState('');
    const [selectedParent, setSelectedParent] = useState(null);

    const mainCategories = categories.filter(c => c.parent_id === null);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        onAdd({ name: newName, parent_id: selectedParent });
        setNewName('');
        setSelectedParent(null);
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    Додати категорію
                </h2>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Назва</label>
                            <input
                                type="text"
                                placeholder="Приклад: Бампери"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 text-slate-900 font-medium placeholder:text-slate-400 outline-none"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Батьківська категорія</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 text-slate-900 font-medium outline-none"
                                value={selectedParent || ''}
                                onChange={(e) => setSelectedParent(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">Головна категорія</option>
                                {mainCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
                    >
                        Зберегти категорію
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    Існуючі категорії
                </h2>

                <div className="space-y-3">
                    {mainCategories.map(parent => (
                        <div key={parent.id} className="border border-slate-50 rounded-2xl overflow-hidden bg-slate-50/30">
                            <div className="p-4 flex items-center justify-between bg-white border-b border-slate-50">
                                <span className="font-black text-slate-700 uppercase text-sm tracking-tight">{parent.name}</span>
                                <button
                                    onClick={() => onDelete(parent.id)}
                                    className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* Підкатегорії */}
                            <div className="p-2 space-y-1">
                                {categories.filter(c => c.parent_id === parent.id).map(child => (
                                    <div key={child.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl ml-4">
                                        <span className="text-sm font-bold text-slate-500">{child.name}</span>
                                        <button
                                            onClick={() => onDelete(child.id)}
                                            className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {categories.filter(c => c.parent_id === parent.id).length === 0 && (
                                    <p className="text-[10px] text-slate-400 italic p-3 ml-4">Немає підкатегорій</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
