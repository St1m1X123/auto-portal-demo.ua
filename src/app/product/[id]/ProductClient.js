"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
import { useCart } from '@/context/CartContext';

export default function ProductClient() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // СТАНИ ДЛЯ ГАЛЕРЕЇ
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    async function getProduct() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error("Помилка:", err.message);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) getProduct();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">Завантаження...</div>;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-montserrat text-slate-900">
        <h1 className="text-2xl font-bold mb-4">Товар не знайдено 😕</h1>
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline uppercase tracking-widest text-sm">
          Повернутися назад
        </button>
      </div>
    );
  }

  // --- ЛОГІКА КАРТИНОК (Збираємо все в один масив) ---
  let allImages = [];
  if (product.images && product.images.length > 0) {
      allImages = product.images;
  } else if (product.image) {
      allImages = [product.image];
  }

  const currentImage = allImages.length > 0 ? allImages[activeImageIndex] : null;

  // --- ЛОГІКА ПОСИЛАНЬ ---
  const shareMessage = `Доброго дня! Цікавить деталь: ${product.name} (OE: ${product.oe || 'не вказано'}). Ціна: ${product.price}. Чи є в наявності?`;
  const encodedMsg = encodeURIComponent(shareMessage);
  const viberLink = `viber://chat?number=%2B380681374018&draft=${encodedMsg}`;
  const tgLink = `https://t.me/+380681374018`;
  const waLink = `https://wa.me/380681374018?text=${encodedMsg}`;
  const telLink = `tel:+380681374018`;

  return (
    <div className="bg-gray-50 min-h-screen font-montserrat pb-20 text-slate-900">

      {/* --- ШАПКА --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            Назад
          </button>
          <span className="text-xs text-slate-400 font-bold uppercase truncate max-w-[150px] md:max-w-none">
            {product.cat} / {product.name}
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- ЛІВА КОЛОНКА (ГАЛЕРЕЯ) --- */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Головне велике фото */}
            <div 
                className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden cursor-zoom-in group relative"
                onClick={() => setIsLightboxOpen(true)}
            >
              <div className="aspect-[4/3] bg-gray-100 relative">
                {currentImage ? (
                  <>
                    <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            🔍 Натисніть для збільшення
                        </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">НЕМАЄ ФОТО</div>
                )}
              </div>
            </div>

            {/* Мініатюри (Тільки якщо фото більше одного) */}
            {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {allImages.map((img, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)} 
                            className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* --- ПРАВА КОЛОНКА (ІНФО) --- */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 p-6 sm:p-10 sticky top-24">

              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">{product.subcat}</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-6 uppercase tracking-tight">{product.name}</h1>

              {/* ЦІННИК */}
              <div className="bg-slate-50 border border-slate-100 rounded-[1.8rem] p-5 mb-8 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ціна запчастини</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">{product.price}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-100 uppercase">В наявності</span>
              </div>

              {/* ХАРАКТЕРИСТИКИ */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">OE Номер</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm uppercase">{product.oe || "—"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Стан</span>
                  <span className="font-black text-slate-800 text-sm uppercase">{product.condition}</span>
                </div>
                <div className="pt-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Опис деталі</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {product.description || "Оригінальна вживана запчастина. Деталь перевірена перед демонтажем, надаємо гарантію на встановлення та перевірку. Доставка кур'єрськими службами по всій Україні."}
                  </p>
                </div>
              </div>

              {/* КНОПКИ КЕРУВАННЯ */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.15em] transition-all active:scale-95 shadow-xl shadow-blue-100"
                  >
                    Швидке замовлення
                  </button>
                  <a
                    href={telLink}
                    className="w-14 h-14 flex items-center justify-center border-2 border-emerald-500 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-emerald-50"
                  >
                    <PhoneIcon className="w-7 h-7" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <a href={viberLink} className="flex flex-col items-center py-4 rounded-2xl border border-slate-100 hover:bg-purple-50 transition-all group">
                    <ViberIcon className="w-6 h-6 text-[#7360f2] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Viber</span>
                  </a>
                  <a href={tgLink} target="_blank" className="flex flex-col items-center py-4 rounded-2xl border border-slate-100 hover:bg-sky-50 transition-all group">
                    <TelegramIcon className="w-6 h-6 text-[#229ED9] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telegram</span>
                  </a>
                  <a href={waLink} target="_blank" className="flex flex-col items-center py-4 rounded-2xl border border-slate-100 hover:bg-green-50 transition-all group">
                    <WhatsAppIcon className="w-6 h-6 text-[#25D366] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* --- LIGHTBOX (ПЕРЕГЛЯД НА ВЕСЬ ЕКРАН) --- */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            {/* Кнопка закриття */}
            <button 
                onClick={() => setIsLightboxOpen(false)} 
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Стрілка ВЛІВО */}
            {allImages.length > 1 && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 md:left-10 text-white/50 hover:text-white transition-colors p-4 bg-white/5 rounded-full hover:bg-white/10"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
            )}

            {/* Головне фото */}
            <img 
                src={currentImage} 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                alt="Full size" 
            />

            {/* Стрілка ВПРАВО */}
            {allImages.length > 1 && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 md:right-10 text-white/50 hover:text-white transition-colors p-4 bg-white/5 rounded-full hover:bg-white/10"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            )}

            {/* Індикатор (1/5) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold tracking-widest bg-black/50 px-3 py-1 rounded-full">
                {activeImageIndex + 1} / {allImages.length}
            </div>
        </div>
      )}

      {/* --- МОДАЛЬНЕ ВІКНО ЗАМОВЛЕННЯ (Без змін) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 font-montserrat">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[98vh]">

            <div className="hidden md:flex md:w-[35%] bg-slate-50 p-10 flex-col justify-center border-r border-slate-100 text-slate-900">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Деталь у замовленні</p>
              <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 mb-6">
                {currentImage && <img src={currentImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-blue-600 tracking-tighter">{product.price}</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">В наявності</span>
              </div>
            </div>

            <div className="w-full md:w-[65%] p-6 md:p-12 overflow-y-auto text-slate-900">
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
                      addToCart(product);
                      setShowModal(false);
                    }}
                    className="w-full bg-white text-blue-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border border-blue-100 hover:bg-blue-50 transition-all"
                  >
                    Додати та продовжити вибір
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}