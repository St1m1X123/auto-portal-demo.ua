"use client";

import React, { useState, Suspense, useEffect } from 'react';
import BrandGrid from '@/components/BrandGrid';
import ModelGrid from '@/components/ModelGrid';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import QuickSearch from '@/components/QuickSearch';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase'; // Наш зв'язок з базою

function AutoPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // --- НОВІ СТАНИ ДЛЯ БАЗИ ДАНИХ ---
  const [allProducts, setAllProducts] = useState([]); // Тут будуть лежати всі товари з бази
  const [isLoading, setIsLoading] = useState(true);   // Стан завантаження

  // Читаємо значення з URL, якщо вони там є
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand'));
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model'));
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category'));
  const [showBanner, setShowBanner] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const searchQuery = searchParams.get('search');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

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

  // --- 2. ЛОГИКА ОБНОВЛЕНИЯ URL (Функция-помощник) ---
  const updateUrl = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);

    // Если меняем бренд - стираем модель и категорию
    if (key === 'brand') { params.delete('model'); params.delete('category'); }
    // Если меняем модель - стираем категорию
    if (key === 'model') { params.delete('category'); }

    // Записываем в историю браузера
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // --- 3. ОБРАБОТЧИКИ КНОПОК (Мгновенные, без setTimeout) ---
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedCategory(null);
    updateUrl('brand', brand);
  };

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setSelectedCategory(null);
    updateUrl('model', model);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    updateUrl('category', category);
  };

  // Кнопки "Назад" внутри интерфейса
  const handleResetToBrands = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedCategory(null);
    router.push('/');
  };

  const handleResetToModels = () => {
    setSelectedModel(null);
    setSelectedCategory(null);
    updateUrl('model', null);
  };

  const handleResetToCategories = () => {
    setSelectedCategory(null);
    updateUrl('category', null);
  };

  const resetFilters = () => router.push('/');

  // --- ЛОГІКА ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ ---
  const filteredProducts = allProducts.filter(product => {
    const pName = (product.name || "").toLowerCase();
    const pModels = String(product.models || "").toLowerCase().trim();
    const pOe = (product.oe || "").toLowerCase().trim();
    const pBrand = String(product.brand || "opel").toLowerCase().trim();

    const brandTarget = (selectedBrand || "").toLowerCase();
    const modelTarget = (selectedModel || "").toLowerCase();
    const searchTarget = (searchQuery || "").toLowerCase();

    // Перевірка на універсальність
    const isUniversal = pModels.includes("всі") || pModels.includes("*") || pBrand === "всі" || pBrand === "universal";

    const matchesBrand = !selectedBrand || pBrand === brandTarget || isUniversal;

    const matchesModel = !selectedModel || pModels.includes(modelTarget) || isUniversal || pName.includes(modelTarget);

    const matchesCategory = !selectedCategory || selectedCategory === 'Всі запчастини' || product.category === selectedCategory;

    const matchesSearch = !searchQuery || pName.includes(searchTarget) || pOe.includes(searchTarget) || pModels.includes(searchTarget);

    return matchesBrand && matchesModel && matchesCategory && matchesSearch;
  })
    // 👇 ДОДАЛИ СОРТУВАННЯ: Спочатку "Автоаксесуари та автохімія", потім все інше
    .sort((a, b) => {
      const priority = "Автоаксесуари та автохімія";
      const isA = a.category === priority;
      const isB = b.category === priority;
      if (isA && !isB) return -1; // a підняти
      if (!isA && isB) return 1;  // b підняти
      return 0; // інакше не міняємо порядок
    });

  // 👇 ТОВАРИ, ЯКІ БАЧИМО ЗАРАЗ (перші 40, потім 80 і т.д.)
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // --- ПОЧАТОК НОВОГО КОДУ: Синхронізація URL ---
  const pathname = usePathname();

  // 1. Слухаємо URL і оновлюємо фільтри (щоб працювала кнопка Назад)
  useEffect(() => {
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const category = searchParams.get('category');

    if (brand !== selectedBrand) setSelectedBrand(brand);
    if (model !== selectedModel) setSelectedModel(model);
    if (category !== selectedCategory) setSelectedCategory(category);
  }, [searchParams]);

  // 2. Функція для вибору (записує в URL)
  const selectFilter = (key, value) => {
    // 1. Миттєво оновлюємо екран (щоб не мигало)
    if (key === 'brand') setSelectedBrand(value);
    if (key === 'model') setSelectedModel(value);
    if (key === 'category') setSelectedCategory(value);

    // 2. Записуємо в URL (для кнопки Назад)
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);

    // Чистимо "хвости"
    if (key === 'brand') { params.delete('model'); params.delete('category'); setSelectedModel(null); setSelectedCategory(null); }
    if (key === 'model') { params.delete('category'); setSelectedCategory(null); }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // --- СКРОЛЛ-МЕНЕДЖЕР (Початок) ---

  // 1. ВІДНОВЛЕННЯ: Коли повернулися на сторінку
  useEffect(() => {
    // Працюємо тільки коли товари вже завантажились
    if (!isLoading && allProducts.length > 0) {
      const savedScroll = sessionStorage.getItem('scrollPosition');
      const savedCount = sessionStorage.getItem('visibleCount');

      if (savedScroll && savedCount) {
        console.log("Відновлюю скролл:", savedScroll);
        // А. Відновлюємо кількість відкритих товарів (щоб було куди скролити)
        setVisibleCount(parseInt(savedCount));

        // Б. Чекаємо долю секунди, поки товари намалюються, і стрибаємо
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll), behavior: 'auto' });

          // Чистимо пам'ять (щоб якщо натиснеш F5, тебе не кидало вниз)
          sessionStorage.removeItem('scrollPosition');
          sessionStorage.removeItem('visibleCount');
        }, 100);
      }
    }
  }, [isLoading, allProducts]);

  // 2. ЗБЕРЕЖЕННЯ: Коли клікаємо на товар
  useEffect(() => {
    const handleProductClick = (e) => {
      // Перевіряємо, чи клікнув користувач на посилання товару (/product/...)
      const link = e.target.closest('a[href^="/product/"]');
      if (link) {
        // Записуємо позицію і кількість товарів у "блокнот"
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
        sessionStorage.setItem('visibleCount', visibleCount.toString());
      }
    };

    // Слухаємо всі кліки на сторінці
    document.addEventListener('click', handleProductClick);

    // Прибираємо слухача, коли йдемо зі сторінки
    return () => document.removeEventListener('click', handleProductClick);
  }, [visibleCount]);

  // --- СКРОЛЛ-МЕНЕДЖЕР (Кінець) ---

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

              <div className="mb-8">
                {/* 1. Якщо нічого не вибрано - показуємо БРЕНДИ */}
                {!selectedBrand && !searchQuery ? (
                  <BrandGrid onSelectBrand={(brand) => selectFilter('brand', brand)} />
                ) :
                  /* 2. Якщо вибрали Бренд - показуємо МОДЕЛІ */
                  selectedBrand && !selectedModel ? (
                    <ModelGrid
                      brand={selectedBrand}
                      onSelectModel={(model) => selectFilter('model', model)}
                      onBack={() => selectFilter('brand', null)}
                    />
                  ) :
                    /* 3. Якщо вибрали Модель - показуємо КАТЕГОРІЇ */
                    selectedModel && (!selectedCategory || selectedCategory === 'Всі запчастини') ? (
                      <CategoryGrid
                        onSelectCategory={(cat) => selectFilter('category', cat)}
                        onBack={() => selectFilter('model', null)}
                      />
                    ) : null}
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
            <QuickSearch
              // 1. Передаємо базу даних (тепер список підкатегорій буде живим)
              allProducts={allProducts}

              // 2. Передаємо початкові значення (щоб поля не збивались)
              initialBrand={selectedBrand}
              initialModel={selectedModel}
              initialCategory={selectedCategory}
              initialSearch={searchQuery}

              // 3. Обробка натискання кнопки "Пошук"
              onSearch={(brand, model, cat, partName) => {
                setIsTransitioning(true);
                const params = new URLSearchParams();

                // Формуємо посилання
                if (brand) params.set('brand', brand);
                if (model) params.set('model', model);
                if (cat && cat !== 'Всі запчастини') params.set('category', cat);

                // ВАЖЛИВО: Якщо вибрали "Тип деталі" (partName), записуємо це в search
                if (partName) params.set('search', partName);

                router.push(`/?${params.toString()}`);

                // Плавне оновлення стейту
                setTimeout(() => {
                  setSelectedBrand(brand);
                  setSelectedModel(model);
                  setSelectedCategory(cat);
                  setIsTransitioning(false);
                }, 300);
              }}
            />

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

              {/* 1. БЛОК ФІЛЬТРІВ (Грід Брендів / Моделей / Категорій) */}
              <div className="mb-8">
                {!selectedBrand ? (
                  <BrandGrid onSelectBrand={handleSelectBrand} />
                ) : !selectedModel ? (
                  <ModelGrid brand={selectedBrand} onSelectModel={handleSelectModel} onBack={handleResetToBrands} />
                ) : (!selectedCategory || selectedCategory === 'Всі запчастини') ? (
                  <CategoryGrid onSelectCategory={handleSelectCategory} onBack={handleResetToModels} />
                ) : null}
              </div>

              {/* 3. СПИСОК ТОВАРІВ */}
              <ProductGrid
                products={visibleProducts}
                categoryName={selectedCategory || "Всі запчастини"}
                hideHeader={false}
                onBack={handleResetToCategories}
              />
              {/* 4. КНОПКА "ПОКАЗАТИ ЩЕ" */}
              {visibleCount < filteredProducts.length && (
                <div className="mt-12 text-center pb-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 40)}
                    className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                  >
                    Показати ще ({filteredProducts.length - visibleCount})
                  </button>
                </div>
              )}
            </div>
          </>
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