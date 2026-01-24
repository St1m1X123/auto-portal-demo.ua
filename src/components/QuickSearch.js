import React, { useState } from 'react';
import CustomSelect from './CustomSelect'; // Додали імпорт нашого нового компонента
import { brands, models, categories, subcategoriesData } from '../utils/inventoryData';

export default function QuickSearch({ onSearch }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [partType, setPartType] = useState('');

  const currentSubcats = subcategoriesData[category] || [];

  const handleSearchClick = () => {
    // Тепер вимагаємо тільки Марку та Модель
    if (make && model) {
      onSearch(make, model, category, partType);
    } else {
      alert("Будь ласка, виберіть Марку та Модель, щоб розпочати пошук");
    }
  };

  return (
    <section className="w-full bg-white border-b border-gray-200 py-3 md:py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 items-center">
          
          {/* 1. МАРКА - тепер через CustomSelect */}
          <CustomSelect 
            label="Марка" 
            options={brands} 
            value={make} 
            onChange={setMake} 
          />

          {/* 2. МОДЕЛЬ */}
          <CustomSelect 
            label="Модель" 
            options={models} 
            value={model} 
            onChange={setModel} 
            disabled={!make} 
          />

          {/* 3. КАТЕГОРІЯ */}
          <CustomSelect 
            label="Категорія" 
            options={categories} 
            value={category} 
            onChange={setCategory} 
            disabled={!model} 
          />

          {/* 4. ТИП ДЕТАЛІ (Чипси) */}
          <CustomSelect 
            label="Тип деталі" 
            options={currentSubcats} 
            value={partType} 
            onChange={setPartType} 
            disabled={!category} 
          />

          {/* КНОПКА ПОШУКУ */}
          <button 
            onClick={handleSearchClick}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-100 uppercase tracking-tight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Пошук
          </button>

        </div>
      </div>
    </section>
  );
}