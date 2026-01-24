"use client";

import React, { useState } from 'react';
import BrandGrid from '@/components/BrandGrid';
import ModelGrid from '@/components/ModelGrid';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import QuickSearch from '@/components/QuickSearch';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function Home() {
  // Міняємо на null, щоб спочатку бачити BrandGrid. Якщо треба тільки Opel — поверни 'OPEL'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search'); // Отримуємо запит з URL (?search=...)
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- ПОКРАЩЕНІ ФУНКЦІЇ ПЕРЕМИКАННЯ ---
  const handleSelectBrand = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedBrand(name);
      setSelectedModel(null); // Обов'язково скидаємо модель при зміні марки
      setSelectedCategory(null); // Скидаємо категорію
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectModel = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedModel(name);
      setSelectedCategory(null); // Скидаємо категорію, щоб показати CategoryGrid
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectCategory = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(name);
      setIsTransitioning(false);
    }, 150);
  };

  // --- ФУНКЦІЇ "НАЗАД" ---
  const handleResetToBrands = () => { setIsTransitioning(true); setTimeout(() => { setSelectedBrand(null); setSelectedModel(null); setSelectedCategory(null); setIsTransitioning(false); }, 150); };
  const handleResetToModels = () => { setIsTransitioning(true); setTimeout(() => { setSelectedModel(null); setSelectedCategory(null); setIsTransitioning(false); }, 150); };
  const handleResetToCategories = () => { setIsTransitioning(true); setTimeout(() => { setSelectedCategory(null); setIsTransitioning(false); }, 150); };

  return (
    <Suspense fallback={<div className="bg-gray-50 text-slate-900 font-sans min-h-screen">
      <main>
        {/* Хедер / Hero */}
        <section className="py-16 px-4 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 uppercase tracking-tighter">
              Авто<span className="text-blue-600">портал</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Швидкий пошук запчастин для вашого авто
            </p>
          </div>
        </section>

        {/* ПЕРЕВІРКА: ПОШУК ЧИ ПЛИТКИ */}
        {searchQuery ? (
          /* --- ЕКРАН РЕЗУЛЬТАТІВ ПОШУКУ --- */
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Результати пошуку: <span className="text-blue-600">{searchQuery}</span>
                </h2>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                  ✕ Закрити пошук
                </button>
              </div>
              
              {/* Передаємо пошуковий запит у ProductGrid */}
              <ProductGrid 
                categoryName="Всі запчастини" 
                globalSearchQuery={searchQuery} 
              />
            </div>
          </section>
        ) : (
          /* --- ТВОЯ ЗВИЧАЙНА ЛОГІКА (QuickSearch + Плитки) --- */
          <>
            <QuickSearch onSearch={(brand, model, cat, part) => {
              setIsTransitioning(true);
              setTimeout(() => {
                setSelectedBrand(brand);
                setSelectedModel(model);
                setSelectedCategory(cat || 'Всі запчастини');
                setIsTransitioning(false);
              }, 150);
            }} />

            {/* ХЛІБНІ КРИХТИ */}
            <div className="max-w-6xl mx-auto px-4 py-4">
              <nav className="text-xs sm:text-sm font-bold flex flex-wrap items-center gap-1 sm:gap-2 text-slate-400 uppercase tracking-widest">
                <button onClick={handleResetToBrands} className={`hover:text-blue-600 transition ${!selectedBrand ? 'text-blue-600' : ''}`}>
                  ВСІ МАРКИ
                </button>
                {selectedBrand && (
                  <><span>/</span><button onClick={handleResetToModels} className={`hover:text-blue-600 transition ${!selectedModel ? 'text-blue-600' : ''}`}>{selectedBrand}</button></>
                )}
                {selectedModel && (
                  <><span>/</span><button onClick={handleResetToCategories} className={`hover:text-blue-600 transition ${!selectedCategory ? 'text-blue-600' : ''}`}>{selectedModel}</button></>
                )}
                {selectedCategory && (
                  <><span>/</span><span className="text-slate-900">{selectedCategory}</span></>
                )}
              </nav>
            </div>

            {/* ПЕРЕМИКАННЯ СІТОК */}
            <div className={`transition-opacity duration-300 min-h-[450px] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {!selectedBrand ? (
                <BrandGrid onSelectBrand={handleSelectBrand} />
              ) : !selectedModel ? (
                <ModelGrid onSelectModel={handleSelectModel} onBack={handleResetToBrands} />
              ) : (!selectedCategory || selectedCategory === 'Всі запчастини') ? (
                <>
                  <CategoryGrid onSelectCategory={handleSelectCategory} onBack={handleResetToModels} />
                  <div className="mt-12 border-t border-gray-100 pt-8">
                    <div className="max-w-6xl mx-auto px-4 mb-4">
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                        Всі запчастини на {selectedModel}
                      </h2>
                    </div>
                    <ProductGrid categoryName="Всі запчастини" hideHeader={true} />
                  </div>
                </>
              ) : (
                <ProductGrid categoryName={selectedCategory} onBack={() => setSelectedCategory('Всі запчастини')} />
              )}
            </div>
          </>
        )}

        {/* Блок переваг */}
        <section className="py-16 px-4 bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Чому ми?</p>
          </div>
        </section>
      </main>
    </div>
</Suspense>
  );
}
