"use client";

import React, { useState, Suspense, useEffect } from 'react';
import BrandGrid from '@/components/BrandGrid';
import ModelGrid from '@/components/ModelGrid';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import QuickSearch from '@/components/QuickSearch';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase'; // Наш зв'язок з базою

function AutoPortalContent() {
  // --- НОВІ СТАНИ ДЛЯ БАЗИ ДАНИХ ---
  const [allProducts, setAllProducts] = useState([]); // Тут будуть лежати всі товари з бази
  const [isLoading, setIsLoading] = useState(true);   // Стан завантаження

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- 1. ЗАВАНТАЖЕННЯ ТОВАРІВ З SUPABASE ---
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        // Тягнемо всі товари з таблиці products
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;
        setAllProducts(data || []);
      } catch (error) {
        console.error('Помилка завантаження товарів:', error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // 2. СИНХРОНІЗАЦІЯ З URL
  useEffect(() => {
    // Включаем режим поиска только если есть запрос, загружены товары 
    // и мы еще НЕ находимся в режиме "Всі запчастини"
    if (searchQuery && allProducts.length > 0 && selectedCategory !== 'Всі запчастини' && !isTransitioning) {
      setSelectedBrand('OPEL');
      setSelectedModel(null);
      setSelectedCategory('Всі запчастини');
    }

    // Если поиск очистили вручную — сбрасываем категорию, чтобы можно было выбирать модели
    if (!searchQuery && selectedCategory === 'Всі запчастини') {
      setSelectedCategory(null);
    }
  }, [searchQuery, allProducts, selectedCategory, isTransitioning]);

  // --- ФУНКЦІЇ ПЕРЕМИКАННЯ (залишаються як були) ---
  const updateURL = (brand, model, cat) => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (model) params.set('model', model);
    if (cat && cat !== 'Всі запчастини') params.set('cat', cat);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSelectBrand = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedBrand(name); setSelectedModel(null); setSelectedCategory(null);
      updateURL(name, null, null);
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectModel = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedModel(name); setSelectedCategory(null);
      updateURL(selectedBrand, name, null);
      setIsTransitioning(false);
    }, 150);
  };

  const handleSelectCategory = (name) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(name);
      updateURL(selectedBrand, selectedModel, name);
      setIsTransitioning(false);
    }, 150);
  };

  const handleResetToBrands = () => {
    setIsTransitioning(true);
    router.push('/'); // Стираем поиск сразу

    setTimeout(() => {
      // Сбрасываем все состояния
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedCategory(null);

      // Второй router.push здесь не нужен, мы уже перешли выше
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

  // --- ЛОГІКА ФІЛЬТРАЦІЇ (V3: FINAL BOSS EDITION) ---
  const filteredProducts = allProducts.filter(product => {
    // Подготовка данных (всё в нижний регистр, чтобы не париться)
    const pName = (product.name || "").toLowerCase();
    const pModels = String(product.models || "").toLowerCase().trim();
    const pOe = (product.oe || "").toLowerCase().trim();
    // Читаем новую колонку BRAND. Якщо пусто — вважаємо це Opel
    const pBrand = String(product.brand || "opel").toLowerCase().trim();

    const brandTarget = (selectedBrand || "").toLowerCase();
    const modelTarget = (selectedModel || "").toLowerCase();
    const searchTarget = (searchQuery || "").toLowerCase();

    // 0. ПЕРЕВІРКА НА УНІВЕРСАЛЬНІСТЬ (Масло, килимки, хімія)
    // Товар універсальний, якщо в моделях або В БРЕНДІ є слова-маркери
    const isUniversal = pModels.includes("всі") || pModels.includes("*") || pModels.includes("777") ||
      pBrand === "всі" || pBrand === "universal";

    // 1. БРЕНД 
    // Товар проходить, якщо:
    // а) Бренд не вибрано
    // б) АБО бренд товару співпадає з обраним (Opel === Opel)
    // в) АБО товар універсальний (isUniversal)
    const matchesBrand = !selectedBrand ||
      pBrand === brandTarget ||
      isUniversal;

    // 2. МОДЕЛЬ
    // Товар проходить, якщо:
    // а) Модель не вибрана
    // б) АБО модель є в списку models
    // в) АБО товар універсальний
    // г) АБО модель згадана в назві
    const matchesModel = !selectedModel ||
      pModels.includes(modelTarget) ||
      isUniversal ||
      pName.includes(modelTarget);

    // 3. КАТЕГОРІЯ
    const matchesCategory = !selectedCategory || selectedCategory === 'Всі запчастини' || product.category === selectedCategory;

    // 4. ПОШУК
    const matchesSearch = !searchQuery ||
      pName.includes(searchTarget) ||
      pOe.includes(searchTarget) ||
      pModels.includes(searchTarget); // Пошук теж бачить моделі

    return matchesBrand && matchesModel && matchesCategory && matchesSearch;
  });

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
                products={filteredProducts}
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

            {/* >>> БАНЕР (ВИПРАВЛЕНИЙ: Великий шрифт, зручний хрестик) <<< */}
            {!selectedBrand && showBanner && (
              <div className="max-w-6xl mx-auto px-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-white border border-blue-100 rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm shadow-blue-50 relative">

                  {/* Хрестик (Максимально в кутку) */}
                  <button
                    onClick={() => setShowBanner(false)}
                    // Було: top-3 right-3 p-2. Стало: top-1 right-1 p-1.
                    className="absolute top-1 right-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full p-1 transition-all"
                    title="Закрити"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="flex items-center gap-4 text-center md:text-left pr-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg text-white shrink-0 shadow-sm">
                      📦
                    </div>
                    <div>
                      {/* Заголовок (Збільшив шрифт до text-sm) */}
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight mb-1">
                        Не знайшли запчастину?
                      </h3>
                      {/* Опис (Збільшив шрифт до text-xs) */}
                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg">
                        Ми можемо знайти та привезти деталь для <span className="text-blue-600 font-bold">будь-якої моделі Opel</span>.
                      </p>
                    </div>
                  </div>

                  {/* Кнопка */}
                  {/* КНОПКА (тепер відкриває вікно) */}
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="whitespace-nowrap bg-blue-600 text-white px-6 py-3 rounded-lg font-bold uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95 w-full md:w-auto text-center"
                  >
                    Замовити
                  </button>
                </div>
              </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-4">
              <nav className="text-xs sm:text-sm font-bold flex flex-wrap items-center gap-1 sm:gap-2 text-slate-400 uppercase tracking-widest">
                {/* Хрестик (Максимально в кутку) */}
                <button
                  onClick={() => setShowBanner(false)}
                  // Було: top-3 right-3 p-2. Стало: top-1 right-1 p-1.
                  className="absolute top-1 right-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-full p-1 transition-all"
                  title="Закрити"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
                    <ProductGrid products={filteredProducts} categoryName="Всі запчастини" hideHeader={true} />
                  </div>
                </>
              ) : (
                <ProductGrid products={filteredProducts} categoryName={selectedCategory} onBack={() => setSelectedCategory('Всі запчастини')} />
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
      {/* --- МОДАЛЬНЕ ВІКНО "ЗАМОВИТИ ПІДБІР" --- */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 font-montserrat">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Заголовок */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-1">Запит на підбір</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ми знайдемо потрібну деталь для вашого Opel</p>
            </div>

            {/* Поля форми */}
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <input type="text" placeholder="Ваше ім'я" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                <input type="tel" placeholder="Номер телефону" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                <textarea rows="3" placeholder="Яка деталь вам потрібна? (Модель, рік, назва...)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm resize-none"></textarea>
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700">
                Надіслати запит
              </button>
            </div>

            {/* Кнопка закриття */}
            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-2 transition-all shadow-sm border border-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
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