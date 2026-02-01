import React from 'react';
import { categories } from '../utils/inventoryData';

export default function CategoryGrid({ onSelectCategory, onBack }) {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Шапка: Кнопка Назад + Заголовок */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
            Категорії запчастин
          </h2>
        </div>

        {/* СІТКА (Оновлена: 6 в ряд) */}
        {/* grid-cols-2 (моб) -> grid-cols-4 (планшет) -> grid-cols-6 (ПК) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-xl p-2 h-24 flex items-center justify-center hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:scale-95 text-center relative overflow-hidden"
            >
              {/* Ефект підсвітки */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Назва категорії */}
              <h3 className="relative z-10 font-bold text-slate-700 group-hover:text-blue-700 text-xs md:text-xs lg:text-sm uppercase tracking-tight leading-snug px-1">
                {cat}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}