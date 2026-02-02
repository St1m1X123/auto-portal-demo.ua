"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dummyProducts } from '../../../utils/inventoryData';
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import PhoneIcon from '@/components/icons/PhoneIcon';
// 1. Імпортуємо хук кошика
import { useCart } from '@/context/CartContext';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  
  // 2. Отримуємо функцію додавання
  const { addToCart } = useCart();

  const product = dummyProducts.find(p => p.id.toString() === params.id);
  const [showModal, setShowModal] = useState(false);

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
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
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

          {/* --- ЛІВА КОЛОНКА (ФОТО) --- */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>
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

      {/* --- МОДАЛЬНЕ ВІКНО ФОРМИ --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 font-montserrat">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[98vh]">
            
            {/* Ліва частина */}
            <div className="hidden md:flex md:w-[35%] bg-slate-50 p-10 flex-col justify-center border-r border-slate-100 text-slate-900">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Деталь у замовленні</p>
                <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 mb-6">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2">{product.name}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-blue-600 tracking-tighter">{product.price}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">В наявності</span>
                </div>
            </div>

            {/* Права частина (Форма) */}
            <div className="w-full md:w-[65%] p-6 md:p-12 overflow-y-auto text-slate-900">
                <div className="md:hidden flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase truncate">{product.name}</h4>
                        <p className="text-blue-600 font-black text-sm">{product.price}</p>
                    </div>
                </div>

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

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-200 pl-3">Примітка / VIN</h4>
                            <span className="text-[9px] font-bold text-slate-400 uppercase italic">Необов'язково</span>
                        </div>
                        <textarea rows="2" placeholder="Напишіть VIN-код для перевірки або примітку..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all shadow-sm resize-none"></textarea>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                        <p className="text-[11px] text-emerald-700 font-bold leading-tight">
                            🤝 Бажаєте консультацію? Просто напишіть контакти, і ми вам зателефонуємо для підбору запчастини!
                        </p>
                    </div>

                    {/* КНОПКИ ДІЇ */}
                    <div className="flex flex-col gap-2 pt-2">
                        <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[13px] tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700">
                            Підтвердити замовлення
                        </button>
                        
                        {/* 3. НОВА КНОПКА "В КОШИК" */}
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