"use client";

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import ProductGrid from '@/components/ProductGrid';
import LeftSidebar from '@/components/LeftSidebar';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase, fetchCategories, fetchProductsWithDetails } from '@/utils/supabase';
import { formatNumber } from '@/utils/format';

function AutoPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- ДАНІ З БАЗИ ---
  const [allProducts, setAllProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ФІЛЬТРИ (всі зберігаємо в одному місці) ---
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand'));
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model'));
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [maxPriceInDb, setMaxPriceInDb] = useState(1000000);
  // Нові фільтри
  const [condition, setCondition] = useState('all');      // 'all' | 'used' | 'new'
  const [partBrand, setPartBrand] = useState(null);       // марка виробника
  const [partType, setPartType] = useState(null);         // тип деталі
  const [inStockOnly, setInStockOnly] = useState(false);  // тільки в наявності

  // --- UI ---
  const [showVinModal, setShowVinModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewMode, setViewMode] = useState('medium'); // 'large' | 'medium' | 'small'

  // --- Ефект для початкового стану сайдбару (Відкритий тільки на ПК) ---
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProductsWithDetails(),
          fetchCategories()
        ]);
        setAllProducts(productsData);
        setDbCategories(categoriesData);
        if (productsData.length > 0) {
          const max = Math.max(...productsData.map(p => Number(p.price) || 0));
          setMaxPriceInDb(max);
          setPriceRange(prev => ({ ...prev, max: max }));
        }
      } catch (error) {
        console.error('Помилка завантаження:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // --- СИНХРОНІЗАЦІЯ URL → стейт (кнопка Назад) ---
  useEffect(() => {
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';
    if (brand !== selectedBrand) setSelectedBrand(brand);
    if (model !== selectedModel) setSelectedModel(model);
    if (category !== selectedCategory) setSelectedCategory(category);
    if (search !== searchQuery) setSearchQuery(search);
  }, [searchParams]);

  // --- ДИНАМІЧНІ ДАНІ ---
  const dynamicBrands = useMemo(() => {
    const brandsSet = new Set(allProducts.map(p => (p.car_brand || 'OPEL').toUpperCase()));
    return Array.from(brandsSet).sort();
  }, [allProducts]);

  const dynamicModels = useMemo(() => {
    if (!selectedBrand) return [];
    const modelsSet = new Set();
    allProducts
      .filter(p => (p.car_brand || 'OPEL').toUpperCase() === selectedBrand.toUpperCase())
      .forEach(p => {
        if (Array.isArray(p.compatible_models)) {
          p.compatible_models.forEach(m => modelsSet.add(m));
        }
      });
    return Array.from(modelsSet).sort();
  }, [allProducts, selectedBrand]);

  // --- ОНОВЛЕННЯ URL (внутрішня функція) ---
  const pushUrl = (brand, model, category, search) => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (model) params.set('model', model);
    if (category && category !== 'Всі запчастини') params.set('category', category);
    if (search) params.set('search', search);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // --- HANDLERS ДЛЯ САЙДБАРУ ---
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedCategory(null);
    pushUrl(brand, null, null, searchQuery);
  };
  const handleModelChange = (model) => {
    setSelectedModel(model);
    setSelectedCategory(null);
    pushUrl(selectedBrand, model, null, searchQuery);
  };
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    pushUrl(selectedBrand, selectedModel, category, searchQuery);
  };
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('search', val); else params.delete('search');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const handleReset = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('default');
    setPriceRange({ min: 0, max: maxPriceInDb });
    setCondition('all');
    setPartBrand(null);
    setPartType(null);
    setInStockOnly(false);
    router.push('/');
  };

  // --- HANDLERS ДЛЯ НАВІГАЦІЇ (Бренди → Моделі → Категорії) ---
  const handleSelectBrand = (brand) => { setSelectedBrand(brand); setSelectedModel(null); setSelectedCategory(null); pushUrl(brand, null, null, searchQuery); };
  const handleSelectModel = (model) => { setSelectedModel(model); setSelectedCategory(null); pushUrl(selectedBrand, model, null, searchQuery); };
  const handleSelectCategory = (category) => { setSelectedCategory(category); pushUrl(selectedBrand, selectedModel, category, searchQuery); };
  const handleResetToBrands = () => { setSelectedBrand(null); setSelectedModel(null); setSelectedCategory(null); router.push('/'); };
  const handleResetToModels = () => { setSelectedModel(null); setSelectedCategory(null); pushUrl(selectedBrand, null, null, searchQuery); };
  const handleResetToCategories = () => { setSelectedCategory(null); pushUrl(selectedBrand, selectedModel, null, searchQuery); };

  // --- СКРОЛЛ-МЕНЕДЖЕР ---
  useEffect(() => {
    if (!isLoading && allProducts.length > 0) {
      const savedScroll = sessionStorage.getItem('scrollPosition');
      const savedCount = sessionStorage.getItem('visibleCount');
      if (savedScroll && savedCount) {
        setVisibleCount(parseInt(savedCount));
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll), behavior: 'auto' });
          sessionStorage.removeItem('scrollPosition');
          sessionStorage.removeItem('visibleCount');
        }, 100);
      }
    }
  }, [isLoading, allProducts]);

  useEffect(() => {
    const handleProductClick = (e) => {
      const link = e.target.closest('a[href^="/product/"]');
      if (link) {
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
        sessionStorage.setItem('visibleCount', visibleCount.toString());
      }
    };
    document.addEventListener('click', handleProductClick);
    return () => document.removeEventListener('click', handleProductClick);
  }, [visibleCount]);

  // --- ФІЛЬТРАЦІЯ З НОВИМИ ФІЛЬТРАМИ ---
  const filteredProducts = useMemo(() => {
    // Знаходимо ID вибраної головної категорії для фільтрації товарів з підкатегорій
    const selectedCatObj = dbCategories?.find(c => c.name === selectedCategory && !c.parent_id);
    const selectedCatId = selectedCatObj ? selectedCatObj.id : null;

    return allProducts.filter(product => {
      const pName = (product.name || "").toLowerCase();
      const pModels = product.compatible_models || [];
      const pOe = (product.oe_number || "").toLowerCase().trim();
      const pBrand = String(product.car_brand || "opel").toLowerCase().trim();
      const pCondition = (product.condition || "").toLowerCase();
      const pPartBrand = (product.part_brand || "").toLowerCase();

      const brandTarget = (selectedBrand || "").toLowerCase();
      const modelTarget = (selectedModel || "").toLowerCase();
      const searchTarget = (searchQuery || "").toLowerCase();

      const isUniversal = pModels.some(m => m === "всі" || m === "*") || pBrand === "всі" || pBrand === "universal";

      const matchesBrand = !selectedBrand || pBrand === brandTarget || isUniversal;
      const matchesModel = !selectedModel || pModels.some(m => m.toLowerCase().includes(modelTarget)) || isUniversal || pName.includes(modelTarget);

      // Категорія збігається, якщо ім'я категорії рівне вибраному АБО якщо батьківська категорія вибрана
      const matchesCategory = !selectedCategory || selectedCategory === 'Всі запчастини' ||
        (product.category && (product.category.name === selectedCategory || product.category.parent_id === selectedCatId));

      const matchesSearch = !searchQuery ||
        pName.includes(searchTarget) ||
        pOe.includes(searchTarget) ||
        (product.category?.name || "").toLowerCase().includes(searchTarget) || // Шукаємо і по назві підкатегорії
        pModels.some(m => m.toLowerCase().includes(searchTarget));
      const matchesPrice = Number(product.price) >= priceRange.min && Number(product.price) <= priceRange.max;

      // Нові фільтри
      const matchesCondition = condition === 'all' || pCondition === condition;
      const matchesPartBrand = !partBrand || pPartBrand === partBrand.toLowerCase();

      // Тип деталі (це тепер справжня підкатегорія в базі)
      const matchesPartType = !partType || (product.category?.name || "").toLowerCase() === partType.toLowerCase();

      const matchesInStock = !inStockOnly || (product.quantity && product.quantity > 0);

      return matchesBrand && matchesModel && matchesCategory && matchesSearch && matchesPrice && matchesCondition && matchesPartBrand && matchesPartType && matchesInStock;
    }).sort((a, b) => {
      const priority = "Автоаксесуари та автохімія";
      const isA = (a.category?.name || "") === priority;
      const isB = (b.category?.name || "") === priority;
      if (isA && !isB) return -1;
      if (!isA && isB) return 1;
      if (sortBy === 'cheap') return Number(a.price) - Number(b.price);
      if (sortBy === 'expensive') return Number(b.price) - Number(a.price);
      return 0;
    });
  }, [allProducts, dbCategories, selectedBrand, selectedModel, selectedCategory, searchQuery, priceRange, sortBy, condition, partBrand, partType, inStockOnly]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // --- НОВІ НАДХОДЖЕННЯ ---
  const newArrivals = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  }, [allProducts]);

  // --- РЕНДЕР ---
  return (
    <div className="bg-gray-50 text-slate-900 font-sans min-h-screen">
      {/* === MOBILE FILTER BUTTON === sticky below header (Top Bar ~36px + Header 64px = 100px) */}
      <div className="md:hidden sticky top-[100px] z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-10 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Фільтри
          {filteredProducts.length > 0 && (
            <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-md ml-1 text-[8px]">
              {filteredProducts.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[{ v: 'large', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
          { v: 'medium', icon: 'M3 5h4v4H3V5zm6 0h4v4H9V5zm6 0h4v4h-4V5zM3 11h4v4H3v-4zm6 0h4v4H9v-4zm6 0h4v4h-4v-4zM3 17h4v4H3v-4zm6 0h4v4H9v-4zm6 0h4v4h-4v-4z' },
          { v: 'small', icon: 'M3 4h2v2H3V4zm4 0h2v2H7V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4zM3 8h2v2H3V8zm4 0h2v2H7V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM3 12h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z' }].map(({ v, icon }) => (
            <button key={v} onClick={() => setViewMode(v)} className={`p-1 rounded transition-all ${viewMode === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d={icon} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* === MAIN LAYOUT: sidebar + content === */}
      <div className="flex min-h-screen relative">

        {/* LEFT SIDEBAR */}
        <LeftSidebar
          allProducts={allProducts}
          dbCategories={dbCategories}
          availableBrands={dynamicBrands}
          selectedBrand={selectedBrand}
          selectedModel={selectedModel}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          priceRange={priceRange}
          maxPrice={maxPriceInDb || 100000}
          condition={condition}
          partBrand={partBrand}
          partType={partType}
          inStockOnly={inStockOnly}
          onBrandChange={handleBrandChange}
          onModelChange={handleModelChange}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={setSortBy}
          onPriceChange={setPriceRange}
          onConditionChange={setCondition}
          onPartBrandChange={setPartBrand}
          onPartTypeChange={setPartType}
          onInStockChange={setInStockOnly}
          onReset={handleReset}
          onOpenVin={() => setShowVinModal(true)}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-4 md:py-6 pb-20">

          {/* Breadcrumbs */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={handleReset}>Головна</span>
            {selectedBrand && (
              <>
                <svg className="w-2.5 h-2.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => handleBrandChange(selectedBrand)}>{selectedBrand}</span>
              </>
            )}
            {selectedModel && (
              <>
                <svg className="w-2.5 h-2.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => handleModelChange(selectedModel)}>{selectedModel}</span>
              </>
            )}
            {selectedCategory && (
              <>
                <svg className="w-2.5 h-2.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="text-slate-600">{selectedCategory}</span>
              </>
            )}
          </div>

          {/* === РОЗДІЛЬНИК === */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Всі запчастини
            </span>
            <div className="flex-1 h-px bg-slate-200" />

            {/* Перемикач виду */}
            <div className="hidden md:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
              {[{ v: 'large', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', title: 'Великий' }, { v: 'medium', icon: 'M3 5h4v4H3V5zm6 0h4v4H9V5zm6 0h4v4h-4V5zM3 11h4v4H3v-4zm6 0h4v4H9v-4zm6 0h4v4h-4v-4zM3 17h4v4H3v-4zm6 0h4v4H9v-4zm6 0h4v4h-4v-4z', title: 'Середній' }, { v: 'small', icon: 'M3 4h2v2H3V4zm4 0h2v2H7V4zm4 0h2v2h-2V4zm4 0h2v2h-2V4zM3 8h2v2H3V8zm4 0h2v2H7V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM3 12h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z', title: 'Компактний' }].map(({ v, icon, title }) => (
                <button key={v} onClick={() => setViewMode(v)} title={title}
                  className={`p-1.5 rounded transition-all ${viewMode === v ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={icon} /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* === СПИСОК ТОВАРІВ === */}
          <ProductGrid
            products={visibleProducts}
            categoryName={selectedCategory || "Всі запчастини"}
            hideHeader={true}
            globalSearchQuery={searchQuery}
            onOpenVin={() => setShowVinModal(true)}
            isLoading={isLoading}
            maxPrice={maxPriceInDb || 100000}
            totalCount={filteredProducts.length}
            viewMode={viewMode}
          />

          {/* Кнопка "Показати ще" */}
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

          {/* === НОВІ НАДХОДЖЕННЯ === */}
          {!selectedBrand && !selectedModel && !searchQuery && newArrivals.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm py-8 px-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
                  Свіжий розбір
                  <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    NEW
                  </div>
                </h2>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full hidden sm:block">
                  Останні 10 надходжень
                </span>
              </div>
              <div className="flex overflow-x-auto custom-scrollbar gap-3 pb-4 snap-x">
                {newArrivals.map(p => (
                  <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="snap-start shrink-0 w-[140px] md:w-[150px] group bg-slate-50 rounded-2xl p-2 md:p-2.5 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden bg-white mb-2 relative">
                      <img src={p.main_image || 'https://placehold.co/400x400?text=No+Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shadow">New</div>
                    </div>
                    <h3 className="text-[10px] md:text-[11px] font-bold text-slate-800 line-clamp-2 leading-snug mb-1">{p.name}</h3>
                    <span className="text-[11px] md:text-xs font-black text-blue-600">{formatNumber(p.price)} <span className="text-slate-400 font-bold text-[8px] uppercase">грн</span></span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* === МОДАЛЬНЕ ВІКНО "ЗАМОВЛЕННЯ" === */}
      {showVinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowVinModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-slate-900 px-8 py-8 text-white relative">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Найдемо <span className="text-blue-400">під замовлення</span></h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Якщо деталі немає в каталозі — ми її знайдемо для вас</p>
              <button onClick={() => setShowVinModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Яка деталь потрібна? (Обов'язково)</label>
                  <textarea rows="2" placeholder="Наприклад: Бампер передній Opel Astra G" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Ваш VIN-код (Необов'язково)</label>
                  <input type="text" placeholder="XWF1234567890ABCD" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-mono uppercase" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Номер телефону (Обов'язково)</label>
                  <input type="tel" placeholder="+38 (0__) ___ __ __" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              <button type="button" onClick={() => { alert('Дякуємо! Ми вже почали пошук. Передзвонимо вам найближчим часом.'); setShowVinModal(false); }} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700">
                Дізнатися ціну та термін
              </button>
            </form>
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