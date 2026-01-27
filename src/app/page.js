"use client";

import React, { useState, Suspense, useEffect } from 'react'; // Додали useEffect
import BrandGrid from '@/components/BrandGrid';
import ModelGrid from '@/components/ModelGrid';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import QuickSearch from '@/components/QuickSearch';
import { useSearchParams, useRouter } from 'next/navigation'; // Додали useRouter

function AutoPortalContent() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter(); // Ініціалізуємо роутер
  const searchQuery = searchParams.get('search');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 1. СИНХРОНІЗАЦІЯ З URL (щоб працювала кнопка Назад)
  useEffect(() => {
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const cat = searchParams.get('cat');

    if (brand) setSelectedBrand(brand);
    if (model) setSelectedModel(model);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Допоміжна функція для оновлення URL
  const updateURL = (brand, model, cat) => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (model) params.set('model', model);
    if (cat && cat !== 'Всі запчастини') params.set('cat', cat);

    // Оновлюємо URL без перезавантаження сторінки
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // --- ФУНКЦІЇ ПЕРЕМИКАННЯ (тепер з оновленням URL) ---
  const handleSelectBrand = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedBrand(name);
      setSelectedModel(null);
      setSelectedCategory(null);
      updateURL(name, null, null); // Оновлюємо посилання
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectModel = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedModel(name);
      setSelectedCategory(null);
      updateURL(selectedBrand, name, null); // Оновлюємо посилання
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectCategory = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(name);
      updateURL(selectedBrand, selectedModel, name); // Оновлюємо посилання
      setIsTransitioning(false);
    }, 150);
  };

  const handleResetToBrands = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedBrand(null); setSelectedModel(null); setSelectedCategory(null);
      router.push('/', { scroll: false }); // Скидаємо URL
      setIsTransitioning(false);
    }, 150);
  };

  const handleResetToModels = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedModel(null); setSelectedCategory(null);
      updateURL(selectedBrand, null, null);
      setIsTransitioning(false);
    }, 150);
  };

  const handleResetToCategories = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(null);
      updateURL(selectedBrand, selectedModel, null);
      setIsTransitioning(false);
    }, 150);
  };

  // Решта коду (return) залишається без змін...
  return (
    <div className="bg-gray-50 text-slate-900 font-sans min-h-screen">
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

        {/* --- ЧИСТИЙ БЛОК ПОШУКУ (ПРАВИЛЬНИЙ) --- */}
        {searchQuery ? (
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">

              {/* Залишаємо ТІЛЬКИ заголовок */}
              <div className="mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Результати пошуку: <span className="text-blue-600">{searchQuery}</span>
                </h2>
              </div>

              {/* Оживляємо стандартну кнопку Назад всередині ProductGrid */}
              <ProductGrid
                categoryName="Всі запчастини"
                globalSearchQuery={searchQuery}
                onBack={handleResetToBrands} // <--- Оце саме те, що ти просив!
              />

            </div>
          </section>
        ) : (
          <>
            <QuickSearch onSearch={(brand, model, cat) => {
              setIsTransitioning(true);
              setTimeout(() => {
                setSelectedBrand(brand);
                setSelectedModel(model);
                setSelectedCategory(cat || 'Всі запчастини');
                updateURL(brand, model, cat);
                setIsTransitioning(false);
              }, 150);
            }} />

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

            <div className={`transition-opacity duration-300 min-h-[450px] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {!selectedBrand ? (
                <BrandGrid onSelectBrand={handleSelectBrand} />
              ) : !selectedModel ? (
                <ModelGrid brand={selectedBrand} onSelectModel={handleSelectModel} onBack={handleResetToBrands} />
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

        {/* --- БЛОК "ЧОМУ МИ?" (стратегический контент) --- */}
        {/* Условие: показываем только когда НЕ выбрана модель и НЕТ поискового запроса */}
        {!selectedModel && !searchQuery && (
          <section className="py-20 px-4 bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                {/* Підпис: тепер текст-xs (замість 10px) і без рваних пробілів */}
                <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-3">
                  Наші переваги
                </p>

                {/* Головний заголовок: без uppercase, щоб букви були чистими */}
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  Чому обирають АВТОПОРТАЛ?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {/* Преимущество 1: Фокус на Опель */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-sm border border-slate-100">⚙️</div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tight mb-3">Тільки Opel</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Ми знаємо все про запчастини Opel. Тільки оригінальні вживані деталі, перевірені перед зняттям з авто.
                  </p>
                </div>

                {/* Преимущество 2: Горохов (Локация) */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-sm border border-slate-100">📍</div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tight mb-3">Склад у Горохові</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Всі деталі в наявності на нашому складі. Ви можете забрати запчастину особисто або замовити швидку відправку.
                  </p>
                </div>

                {/* Преимущество 3: Гарантия/Доставка */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-sm border border-slate-100">🚚</div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tight mb-3">Гарантія та Сервіс</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Відправляємо Новою Поштою в день замовлення. Надаємо час на встановлення та перевірку кожної запчастини.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Завантаження порталу...</div>}>
      <AutoPortalContent />
    </Suspense>
  );
}