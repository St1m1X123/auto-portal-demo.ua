import React from 'react';
import { models } from '../utils/inventoryData';

export default function ModelGrid({ onSelectModel, onBack }) {
  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Контейнер для кнопки та заголовка */}
        <div className="mb-6 flex items-center gap-4">
          {/* Кнопка "Назад" */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            {/* Іконка стрілочки */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

          {/* Твій існуючий заголовок */}
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            КАТАЛОГ МОДЕЛЕЙ
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {models.map((model) => (
            <div
              key={model} // Раніше було model.id
              onClick={() => onSelectModel(model)} // Раніше було model.name
              className="group cursor-pointer bg-white border border-gray-200 rounded-md p-4 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50/30 transition-all active:scale-95"
            >
              <h3 className="font-bold text-slate-600 group-hover:text-blue-700 text-sm md:text-base transition-colors text-center leading-tight">
                {model} {/* ОЦЕ ГОЛОВНЕ: просто {model}, а не {model} */}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}