"use client";

import React, { useState, useEffect, useMemo } from 'react';
import CustomSelect from './CustomSelect';
import { logSearchQuery } from '@/utils/supabase';

export default function QuickSearch({
  onSearch,
  allProducts = [],
  dbCategories = [], // Отримуємо категорії з бази
  availableBrands = [], // Отримуємо живі бренди
  availableModels = [], // Отримуємо живі моделі
  initialBrand = '',
  initialModel = '',
  initialCategory = '',
  initialSearch = ''
}) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState(initialModel || '');
  const [category, setCategory] = useState(initialCategory || '');
  const [partType, setPartType] = useState('');
  const canSearch = Boolean(make);

  // Динамічний список моделей на основі обраної марки
  const filteredModels = useMemo(() => {
    if (!make) return [];

    const modelsSet = new Set();
    const searchMake = make.toUpperCase();

    allProducts
      .filter(p => (p.car_brand || 'OPEL').toUpperCase() === searchMake)
      .forEach(p => {
        if (Array.isArray(p.compatible_models)) {
          p.compatible_models.forEach(m => modelsSet.add(m));
        }
      });

    return Array.from(modelsSet).sort();
  }, [allProducts, make]);

  // 1. СИНХРОНІЗАЦІЯ
  useEffect(() => {
    setMake(initialBrand || '');
    setModel(initialModel || '');

    if (initialCategory && initialCategory !== 'Всі запчастини') {
      setCategory(initialCategory);
    } else {
      setCategory('');
    }

    setPartType(initialSearch || '');
  }, [initialBrand, initialModel, initialCategory, initialSearch]);

  // Список назв категорій для селектора
  const categoryNames = useMemo(() => {
    return dbCategories.filter(c => c.parent_id === null).map(c => c.name);
  }, [dbCategories]);

  // 2. ОТРИМАННЯ ПІДКАТЕГОРІЙ З БАЗИ (На основі обраної категорії)
  const currentSubcats = useMemo(() => {
    if (!category || !dbCategories.length) return [];

    // Знаходимо ID обраної категорії
    const parent = dbCategories.find(c => c.name === category);
    if (!parent) return [];

    // Повертаємо назви всіх дочірніх категорій
    return dbCategories
      .filter(c => c.parent_id === parent.id)
      .map(c => c.name)
      .sort();
  }, [dbCategories, category]);



  const handleSearchClick = () => {
    if (!canSearch) return;

    // Логуємо пошук для аналітики
    const logQuery = partType || `${make} ${model} ${category}`.trim().replace(/\s+/g, ' ');
    if (logQuery) logSearchQuery(logQuery);

    onSearch(make, model, category, partType);
  };

  return (
    <section className="w-full bg-white border-b border-gray-200 py-3 md:py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 items-center">

          <CustomSelect
            label="Марка"
            options={availableBrands}
            value={make}
            onChange={setMake}
          />

          <CustomSelect
            label="Модель"
            options={filteredModels}
            value={model}
            onChange={setModel}
            disabled={!make}
          />

          <CustomSelect
            label="Категорія"
            options={categoryNames}
            value={category}
            onChange={setCategory}
            disabled={!make}
          />

          <CustomSelect
            label="Тип деталі"
            options={currentSubcats}
            value={partType}
            onChange={setPartType}
            disabled={!make}
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