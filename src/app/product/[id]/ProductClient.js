"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
import { useCart } from '@/context/CartContext';
import { incrementProductViews } from '@/utils/supabase';
import { formatPrice } from '@/utils/format';

export default function ProductClient({ initialProduct }) {
  const router = useRouter();
  const { addToCart, removeFromCart, cart } = useCart();
  const [product, setProduct] = useState(initialProduct);
  const [showSticky, setShowSticky] = useState(false);
  const buyButtonRef = useRef(null);

  // Стани для кошика та анімації
  const [isAdding, setIsAdding] = useState(false);

  // Відстеження унікального перегляду за сесію
  useEffect(() => {
    if (product?.id) {
      const viewedProducts = JSON.parse(sessionStorage.getItem('viewed_products') || '[]');

      if (!viewedProducts.includes(product.id)) {
        incrementProductViews(product.id);
        viewedProducts.push(product.id);
        sessionStorage.setItem('viewed_products', JSON.stringify(viewedProducts));
      }
    }
  }, [product?.id]);

  // Стікі-кнопка для мобільних + зміна позиції FloatingContact
  useEffect(() => {
    const handleScroll = () => {
      if (buyButtonRef.current) {
        const rect = buyButtonRef.current.getBoundingClientRect();
        const isSticky = rect.bottom < 0;
        setShowSticky(isSticky);

        // Керування відступом плаваючої кнопки контактів (піднімаємо вище, щоб не закривало "Купити")
        if (isSticky) {
          document.documentElement.style.setProperty('--floating-bottom', '110px');
        } else {
          document.documentElement.style.setProperty('--floating-bottom', '24px');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.style.setProperty('--floating-bottom', '24px');
    };
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('order'); // 'order' або 'vin'

  const openModal = (mode) => {
    setModalMode(mode);
    setShowModal(true);
  };

  const isInCart = product && cart.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    if (isInCart) {
      if (!isAdding) removeFromCart(product.id);
    } else {
      addToCart(product);
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 1200); // Пауза перед можливістю видалення
    }
  };

  // Галерея
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  if (!product) return null;

  // Безпечне отримання картинок
  const images = (product.images && product.images.length > 0)
    ? product.images.filter(img => typeof img === 'string' && img.trim() !== '')
    : (product.main_image && typeof product.main_image === 'string' && product.main_image.trim() !== '' ? [product.main_image] : []);

  const finalImages = images.length > 0 ? images : ['https://placehold.co/400x400?text=No+Image'];
  const currentImage = finalImages[activeImageIndex] || finalImages[0];

  const displayPrice = formatPrice(product.price);
  const modelsArray = product.compatible_models || [];

  const MAX_VISIBLE_MODELS = 3;
  const visibleModels = showAllModels ? modelsArray : modelsArray.slice(0, MAX_VISIBLE_MODELS);
  const hiddenCount = Math.max(0, modelsArray.length - MAX_VISIBLE_MODELS);

  const messageText = `Добрий день! Цікавить запчастина: ${product.name} (Код: ${product.sku || product.id}).`;
  const encodedMsg = encodeURIComponent(messageText);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24 md:pb-12 pt-4 md:pt-6 font-sans select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Хлібні крихти / Назад */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Назад до списку</span>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* === ГАЛЕРЕЯ === */}
            <div className="lg:col-span-7 p-4 md:p-8">
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 group">
                <img
                  loading="lazy"
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Лічильник фото */}
                {finalImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-white/10 uppercase">
                    {activeImageIndex + 1} / {finalImages.length} фото
                  </div>
                )}

                {/* Бейдж стану */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-blue-200 uppercase tracking-widest border border-blue-500/20">
                    {product.condition || 'Б/В Оригінал'}
                  </span>
                </div>
              </div>

              {/* Мініатюри */}
              {finalImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide px-1">
                  {finalImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImageIndex === idx ? 'border-blue-600 shadow-lg shadow-blue-100 scale-105 z-10' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === ІНФОРМАЦІЯ === */}
            <div className="lg:col-span-5 p-6 md:p-10 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-slate-100">

              {/* Код + Статус */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Артикул запчастини</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 leading-none">Код: {product.sku || product.id}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(product.sku || product.id)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Копіювати артикул"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${product.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {product.status === 'active' ? 'В наявності' : 'Немає'}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Оновлено сьогодні</p>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight italic select-text">
                {product.name}
              </h1>

              {/* Ціна */}
              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 mb-8 select-text">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">
                    {displayPrice.split(' ')[0]}
                  </span>
                  <span className="text-xl font-black text-slate-400 uppercase">грн</span>
                </div>
                {product.oe_number && (
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 pt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Оригінальний номер (OE)</span>
                    <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm select-text">
                      {product.oe_number}
                    </span>
                  </div>
                )}
              </div>

              {/* Характеристики */}
              <div className="space-y-4 mb-8 select-text">
                <div className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Марка авто</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{product.car_brand}</span>
                </div>

                <div className="flex items-start justify-between group py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Сумісні моделі</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {modelsArray.length > 0 ? (
                      <>
                        {visibleModels.map((m, i) => (
                          <span key={i} className="text-[9px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">{m}</span>
                        ))}
                        {hiddenCount > 0 && !showAllModels && (
                          <button onClick={() => setShowAllModels(true)} className="text-[9px] font-black text-blue-600 hover:underline">+{hiddenCount}</button>
                        )}
                      </>
                    ) : (
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase border border-emerald-100">На всі моделі</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Кнопки */}
              <div className="mt-auto space-y-4" ref={buyButtonRef}>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal('order')}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4.5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                  >
                    <span>Швидке замовлення</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>

                  <div className="flex gap-2">
                    <a
                      href="tel:+380681374018"
                      className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-2 border-slate-100 rounded-2xl text-slate-900 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95 bg-white shadow-sm group"
                      title="Зателефонувати"
                    >
                      <div className="transition-transform group-hover:-translate-y-1 duration-300">
                        <PhoneIcon className="w-6 h-6 " />
                      </div>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border-2 transition-all group ${isInCart ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600 active:scale-95'} ${isAdding ? 'pointer-events-none opacity-80' : ''}`}
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Додаємо...</span>
                      </div>
                    ) : isInCart ? (
                      <>
                        <div className={`flex items-center gap-2 transition-all duration-300 animate-in fade-in zoom-in ${!isAdding ? 'group-hover:hidden' : ''}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          <span>У кошику</span>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-2 text-red-600 transition-all duration-300 animate-in fade-in zoom-in">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          <span>Прибрати</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <span>До кошика</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openModal('vin')}
                    className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border-2 border-blue-50 bg-blue-50/30 text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    VIN-перевірка
                  </button>
                </div>

                {/* Додаткові месенджери */}
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 italic">
                  <a href={`viber://chat?number=%2B380681374018&draft=${encodedMsg}`} className="text-[#7360f2] hover:opacity-80 transition-opacity flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                    <ViberIcon className="w-4 h-4" /> Viber
                  </a>
                  <a href="https://t.me/+380681374018" target="_blank" className="text-[#229ED9] hover:opacity-80 transition-opacity flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                    <TelegramIcon className="w-4 h-4" /> Telegram
                  </a>
                  <a href={`https://wa.me/380681374018?text=${encodedMsg}`} target="_blank" className="text-[#25D366] hover:opacity-80 transition-opacity flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                    <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Опис */}
        {product.description && (
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 mt-6 select-text">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Детальний опис</h3>
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line font-medium text-base md:text-lg">
              {product.description}
            </div>
          </div>
        )}

        {/* Блок довіри */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Гарантія 14 днів</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-1">На встановлення запчастини</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Реальні фото</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Отримуєте саме цей товар</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Швидка доставка</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Відправка у день замовлення</p>
            </div>
          </div>
        </div>

      </div>

      {/* Контакти внизу */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pb-12">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h4 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Маєте питання?</h4>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Ми на зв'язку у всіх месенджерах</p>
            </div>
            <div className="flex gap-6">
              <a href={`viber://chat?number=%2B380681374018&draft=${encodedMsg}`} className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group">
                <ViberIcon className="w-8 h-8 text-[#7360f2] group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://t.me/+380681374018" target="_blank" className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group">
                <TelegramIcon className="w-8 h-8 text-[#229ED9] group-hover:scale-110 transition-transform" />
              </a>
              <a href={`https://wa.me/380681374018?text=${encodedMsg}`} target="_blank" className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group">
                <WhatsAppIcon className="w-8 h-8 text-[#25D366] group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
          {/* Декор */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (MOBILE ONLY) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-lg border-t border-slate-100 p-4 transition-transform duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex gap-3 items-center">
          <div className="flex-grow min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{product.name}</p>
            <p className="text-xl font-black text-blue-600 tracking-tighter leading-none">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={() => openModal('order')}
            className="bg-blue-600 text-white px-10 py-4.5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-blue-200"
          >
            Купити
          </button>
        </div>
      </div>

      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-10 bg-white/10 rounded-full transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-4 text-white p-4 hover:bg-white/10 rounded-full transition-all z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          <img src={currentImage} alt={product.name} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in duration-300" />

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 text-white p-4 hover:bg-white/10 rounded-full transition-all z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      )}

      {/* МОДАЛКА ШВИДКОГО ЗАМОВЛЕННЯ / VIN ПЕРЕВІРКИ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-in slide-in-from-bottom-5 duration-500 border border-white/20">

            {/* Товар */}
            <div className="hidden md:flex md:w-[40%] bg-slate-900 p-10 flex-col text-white relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
                  {modalMode === 'vin' ? 'Перевірка сумісності' : 'Ваше замовлення'}
                </p>
                <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 mb-8 p-1 shadow-2xl">
                  <img src={currentImage} alt="" className="w-full h-full object-cover rounded-[1.4rem]" />
                </div>
                <h3 className="text-xl font-black uppercase leading-tight mb-4 line-clamp-3 italic select-text">{product.name}</h3>
                {modalMode === 'order' && (
                  <div className="mt-auto pt-6 border-t border-white/10 flex items-baseline gap-2 select-text">
                    <span className="text-4xl font-black tracking-tighter">{formatPrice(product.price).split(' ')[0]}</span>
                    <span className="text-sm font-black text-slate-400 uppercase">грн</span>
                  </div>
                )}
                {modalMode === 'vin' && (
                  <div className="mt-auto pt-6 border-t border-white/10 select-text">
                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                      Ми перевіримо підходить цей товар до вашого авто за VIN-кодом.
                    </p>
                  </div>
                )}
              </div>
              {/* Декор */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-black/40 pointer-events-none"></div>
            </div>

            {/* Форма */}
            <div className="w-full md:w-[60%] p-8 md:p-14 overflow-y-auto scrollbar-hide bg-white translate-z-0">
              <div className="space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 italic">
                      {modalMode === 'vin' ? 'VIN-перевірка' : 'Оформити'}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {modalMode === 'vin' ? 'Залиште дані для перевірки' : 'Будь ласка, заповніть дані'}
                    </p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors shadow-sm">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Контакти */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      Контактні дані
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative">
                        <input type="text" placeholder="Ваше ім'я та прізвище" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                      </div>
                      <div className="relative">
                        <input type="tel" placeholder="+38 (___) ___ __ __" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Примітка / VIN */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] ml-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        Примітка або VIN-код
                      </div>
                      {modalMode === 'order' && <span className="text-[9px] text-slate-400 lowercase italic">необов'язково</span>}
                      {modalMode === 'vin' && <span className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">Обов'язково</span>}
                    </label>
                    <textarea
                      placeholder={modalMode === 'vin' ? "Напишіть VIN вашого авто для точної перевірки" : "Додайте опис або VIN для перевірки на сумісність"}
                      rows="2"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm resize-none"
                    ></textarea>
                  </div>

                  {/* Доставка */}
                  {modalMode === 'order' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] ml-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          Доставка (Нова Пошта)
                        </div>
                        <span className="text-[9px] text-slate-400 lowercase italic">необов'язково</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Місто" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                        <input type="text" placeholder="№ Відділення" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                    <span>{modalMode === 'vin' ? 'Надіслати на перевірку' : 'Підтвердити замовлення'}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-8 tracking-widest leading-relaxed">
                    {modalMode === 'vin'
                      ? "Ми отримаємо запит і повідомимо вас про сумісність"
                      : "Наш менеджер зв'яжеться з вами для уточнення деталей оплати та доставки"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
