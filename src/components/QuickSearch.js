import React, { useState, useEffect, useMemo } from 'react';
import CustomSelect from './CustomSelect';
// Ми прибрали subcategoriesData, бо тепер беремо дані з бази!
import { brands, models, categories } from '../utils/inventoryData';

export default function QuickSearch({ 
  onSearch, 
  allProducts = [], // <--- Отримуємо базу товарів
  initialBrand = '', 
  initialModel = '', 
  initialCategory = '',
  initialSearch = '' 
}) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [partType, setPartType] = useState('');
  const canSearch = Boolean(make && model);

  // 1. СИНХРОНІЗАЦІЯ (Щоб при поверненні назад поля були заповнені)
  useEffect(() => {
    setMake(initialBrand || '');
    setModel(initialModel || '');
    
    // Категорію ставимо тільки якщо це не "Всі"
    if (initialCategory && initialCategory !== 'Всі запчастини') {
      setCategory(initialCategory);
    } else {
      setCategory('');
    }
    
    setPartType(initialSearch || '');
  }, [initialBrand, initialModel, initialCategory, initialSearch]);

  // 2. АВТОМАТИЧНИЙ СПИСОК ПІДКАТЕГОРІЙ (З БАЗИ)
  const currentSubcats = useMemo(() => {
    // Якщо база порожня або модель не вибрана — список порожній
    if (!allProducts.length || !model) return [];

    // Приводимо вибір до нижнього регістру для пошуку
    const searchMake = make.toLowerCase();
    const searchModel = model.toLowerCase();
    const searchCat = category.toLowerCase();

    // Фільтруємо товари, що підходять під вибір
    const filtered = allProducts.filter(p => {
      const pBrand = String(p.brand || '').toLowerCase();
      const pModels = String(p.models || '').toLowerCase();
      const pCategory = String(p.category || '').toLowerCase();

      // Перевірка Бренду
      const matchBrand = !make || pBrand === searchMake;
      
      // Перевірка Моделі (шукаємо входження, наприклад "Vectra" в "Vectra C")
      const matchModel = pModels.includes(searchModel) || pModels.includes('всі');
      
      // Перевірка Категорії (якщо вибрана)
      const matchCat = !category || category === 'Всі запчастини' || pCategory === searchCat;

      return matchBrand && matchModel && matchCat;
    });

    // Витягуємо з знайдених товарів поле 'subcat', прибираємо дублікати і сортуємо
    return filtered
      .map(p => p.subcat)
      .filter(Boolean) // Прибираємо порожні (null, undefined)
      .map(s => s.trim()) // Прибираємо зайві пробіли
      .filter((val, i, arr) => arr.indexOf(val) === i) // Лишаємо тільки унікальні
      .sort();
      
  }, [allProducts, make, model, category]);

  // Очищення залежних полів при зміні батьківських
  useEffect(() => {
     // Якщо змінили марку/модель, але старий "Тип деталі" більше не підходить -> стираємо його
     if (partType && !currentSubcats.includes(partType)) {
         setPartType('');
     }
  }, [make, model, category, currentSubcats]);

  const handleSearchClick = () => {
    if (!canSearch) return;
    onSearch(make, model, category, partType);
  };

  return (
    <section className="w-full bg-white border-b border-gray-200 py-3 md:py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 items-center">
          
          <CustomSelect 
            label="Марка" 
            options={brands} 
            value={make} 
            onChange={setMake} 
          />

          <CustomSelect 
            label="Модель" 
            options={models} 
            value={model} 
            onChange={setModel} 
            disabled={!make} 
          />

          <CustomSelect 
            label="Категорія" 
            options={categories} 
            value={category} 
            onChange={setCategory} 
            disabled={!model} 
          />

          {/* ТИП ДЕТАЛІ: Тепер береться з currentSubcats (з бази) */}
          <CustomSelect 
            label="Тип деталі" 
            options={currentSubcats} 
            value={partType} 
            onChange={setPartType} 
            disabled={!category} 
          />

          <button 
            onClick={handleSearchClick}
            disabled={!canSearch}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-100 uppercase tracking-tight disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:active:scale-100"
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