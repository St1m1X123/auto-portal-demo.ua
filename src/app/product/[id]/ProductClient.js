"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
import { useCart } from '@/context/CartContext';

export default function ProductClient({ initialProduct }) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(initialProduct);
  const [showModal, setShowModal] = useState(false);
  const isInCart = product && cart.some((item) => item.id === product.id);

  // Галерея
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  if (!product) return null;

  // Безпечне отримання картинок
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);

  const currentImage = images[activeImageIndex];

  // --- ЛОГІКА ЦІНИ ---
  const getPriceDisplay = () => {
    if (!product.price) return 'Ціна договірна';
    const priceStr = String(product.price);
    if (priceStr.includes('грн') || isNaN(parseFloat(priceStr))) {
      return priceStr;
    }
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      maximumFractionDigits: 0
    }).format(product.price);
  };
  const displayPrice = getPriceDisplay();

  // Моделі: перетворюємо строку в масив і керуємо скороченим / повним виглядом
  const modelsArray = product.models
    ? String(product.models)
        .split(/[,;]/)
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  const MAX_VISIBLE_MODELS = 2;
  const visibleModels = showAllModels
    ? modelsArray
    : modelsArray.slice(0, MAX_VISIBLE_MODELS);
  const hiddenCount = Math.max(0, modelsArray.length - MAX_VISIBLE_MODELS);

  // Посилання для месенджерів
  const messageText = `Добрий день! Цікавить запчастина: ${product.name} (Код: ${product.id}).`;
  const encodedMsg = encodeURIComponent(messageText);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12 pt-4 md:pt-6 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Кнопка НАЗАД (Оригинал) */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          Назад
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* === ЛІВА КОЛОНКА (ФОТО) === */}
            <div className="lg:col-span-7 p-4 md:p-6 bg-white">
              <div
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
              >
                {images.length > 0 ? (
                  <img
                    loading="lazy"
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Фото відсутнє</div>
                )}

                {/* Бейдж стану */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 uppercase tracking-wider">
                    {product.condition || 'Б/В'}
                  </span>
                </div>
              </div>

              {/* Мініатюри */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === ПРАВА КОЛОНКА (ІНФО) === */}
            <div className="lg:col-span-5 p-6 md:p-10 bg-white lg:border-l border-slate-100 flex flex-col h-full">

              {/* Код і Статус */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                    ID: {product.id}
                  </span>
                  {product.oe && (
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                      OE: {product.oe}
                    </span>
                  )}
                </div>

                <div>
                  {product.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> В наявності
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-600 text-[10px] font-black uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Продано
                    </span>
                  )}
                </div>
              </div>

              {/* Назва */}
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                {product.name}
              </h1>

              {/* Ціна (Тільки цифри, жирно і синім) */}
              <div className="mb-8 pb-6 border-b border-slate-100">
                <div className="text-4xl font-black text-blue-600 tracking-tighter">
                  {displayPrice}
                </div>
              </div>

              {/* Характеристики (Чистий список) */}
              <div className="space-y-4 mb-10 text-sm">
                {product.brand && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Марка</span>
                    <span className="font-bold text-slate-900">{product.brand}</span>
                  </div>
                )}
                {product.models && modelsArray.length > 0 && (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs whitespace-nowrap shrink-0">
                      Модель
                    </span>
                    <div
                      className={`flex gap-1.5 justify-start sm:justify-end w-full min-w-0 ${
                        showAllModels
                          ? 'flex-wrap'
                          : 'flex-nowrap overflow-x-auto'
                      }`}
                    >
                      {visibleModels.map((model, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap shrink-0"
                        >
                          {model}
                        </span>
                      ))}
                      {!showAllModels && hiddenCount > 0 && (
                        <button
                          onClick={() => setShowAllModels(true)}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-wide hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                        >
                          +{hiddenCount} моделі
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Категорія</span>
                    <span className="font-bold text-slate-900">{product.category}</span>
                  </div>
                )}
              </div>

              {/* === БЛОК КНОПОК === */}
              <div className="mt-auto space-y-3">

                {/* Ряд 1 (ГЛАВНЫЙ): ШВИДКЕ ЗАМОВЛЕННЯ + ТЕЛЕФОН */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Швидке замовлення
                  </button>

                  <a
                    href="tel:+380681374018"
                    className="w-16 flex-shrink-0 flex items-center justify-center border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all active:scale-95 shadow-sm bg-white"
                  >
                    <PhoneIcon className="w-6 h-6" />
                  </a>
                </div>

                {/* Ряд 2: В КОШИК */}
                <button
                  onClick={() => !isInCart && addToCart(product)}
                  disabled={isInCart}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isInCart
                      ? 'text-emerald-600 border-2 border-emerald-200 bg-emerald-50 cursor-default'
                      : 'text-slate-500 border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600 bg-white'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Додано до кошику
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      Додати в кошик
                    </>
                  )}
                </button>

                {/* Ряд 3: МЕСЕНДЖЕРИ */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <a href={`viber://chat?number=%2B380681374018&draft=${encodedMsg}`} className="flex flex-col items-center py-3 rounded-2xl border border-slate-100 hover:bg-purple-50 transition-all group bg-slate-50">
                    <ViberIcon className="w-6 h-6 text-[#7360f2] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Viber</span>
                  </a>
                  <a href={`https://t.me/+380681374018`} target="_blank" className="flex flex-col items-center py-3 rounded-2xl border border-slate-100 hover:bg-sky-50 transition-all group bg-slate-50">
                    <TelegramIcon className="w-6 h-6 text-[#229ED9] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telegram</span>
                  </a>
                  <a href={`https://wa.me/380681374018?text=${encodedMsg}`} target="_blank" className="flex flex-col items-center py-3 rounded-2xl border border-slate-100 hover:bg-green-50 transition-all group bg-slate-50">
                    <WhatsAppIcon className="w-6 h-6 text-[#25D366] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Опис */}
        {product.description && (
          <div className="mt-6 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Опис запчастини</h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {product.description}
            </div>
          </div>
        )}

      </div>

      {/* --- МОДАЛЬНЕ ВІКНО ЗАМОВЛЕННЯ (ПОВЕРНУЛИ ТВОЮ ФОРМУ 1 в 1) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 font-sans">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[98vh] animate-in fade-in zoom-in duration-200">

            {/* Ліва частина модалки (Товар) */}
            <div className="hidden md:flex md:w-[35%] bg-slate-50 p-10 flex-col justify-center border-r border-slate-100 text-slate-900">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Деталь у замовленні</p>
              <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 mb-6">
                {currentImage && <img src={currentImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-blue-600 tracking-tighter">{displayPrice}</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">В наявності</span>
              </div>
            </div>

            {/* Права частина модалки (Форма) */}
            <div className="w-full md:w-[65%] p-6 md:p-12 overflow-y-auto text-slate-900 scrollbar-hide">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Обов'язкові дані</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Прізвище та Ім'я" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                    <input type="tel" placeholder="Номер телефону" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-200 pl-3">Доставка НП</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase italic">Необов'язково</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Місто" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                    <input type="text" placeholder="Відділення №" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <p className="text-[11px] text-emerald-700 font-bold leading-tight">
                    🤝 Бажаєте консультацію? Просто напишіть контакти, і ми вам зателефонуємо для підбору запчастини!
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[13px] tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700">
                    Підтвердити замовлення
                  </button>

                  <button
                    onClick={() => {
                      if (!isInCart) addToCart(product);
                      setShowModal(false);
                    }}
                    disabled={isInCart}
                    className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${
                      isInCart
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                        : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                    }`}
                  >
                    {isInCart ? 'Додано до кошику' : 'Додати та продовжити вибір'}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors bg-transparent p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX (С КНОПКАМИ ЛИСТАНИЯ) */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>

          {/* Кнопка закрыть */}
          <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2 z-10 bg-white/10 rounded-full transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Стрелка ВЛЕВО (показываем только если фоток > 1) */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Чтобы не закрылось окно
                setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-4 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          {/* Сама картинка */}
          <img
            src={images[activeImageIndex]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />

          {/* Стрелка ВПРАВО */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 text-white/50 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

          {/* Индикатор (1/5) */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest backdrop-blur-sm">
              {activeImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}