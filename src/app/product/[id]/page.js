"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dummyProducts } from '../../../utils/inventoryData';
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();

  const product = dummyProducts.find(p => p.id.toString() === params.id);
  const isInStock = true; // Якщо false - буде синя плашка "Під замовлення"
  const [mainImage, setMainImage] = useState(product?.image);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 text-center">Товар не знайдено 😕</h1>
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline uppercase tracking-widest text-sm">
          Повернутися назад
        </button>
      </div>
    );
  }

  // --- ЛОГІКА ПОВІДОМЛЕННЯ ---
  const shareMessage = `Доброго дня! Цікавить деталь: ${product.name} (OE: ${product.oe || 'не вказано'}). Ціна: ${product.price}. Чи є в наявності?`;
  const encodedMsg = encodeURIComponent(shareMessage);

  const viberLink = `viber://chat?number=%2B380681374018&draft=${encodedMsg}`;
  const waLink = `https://wa.me/380681374018?text=${encodedMsg}`;
  const tgLink = `https://t.me/+380681374018`;
  const telLink = `tel:+380681374018`;

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">

      {/* --- ШАПКА --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            Назад
          </button>
          <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
          <span className="text-xs sm:text-sm text-slate-400 font-bold uppercase truncate max-w-[200px] md:max-w-none">
            {product.cat} / {product.name}
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- ЛІВА КОЛОНКА (ФОТО) --- */}
          <div className="lg:col-span-7">
            <div className="relative bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden group">
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={mainImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* ПЛАШКА СТАНУ (В КУТКУ) */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md border border-white/50 uppercase tracking-widest">
                    {product.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- ПРАВА КОЛОНКА (ІНФО) --- */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-24">

              <div className="mb-6">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">
                  {product.subcat}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {product.price}
                  </span>

                  {/* СТАТУС НАЯВНОСТІ */}
                  {isInStock ? (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-md">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">В наявності</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-sky-50 border border-sky-100/50 px-2.5 py-1 rounded-md">
                      <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                      <span className="text-sky-700 text-[11px] font-bold uppercase tracking-wider">Під замовлення</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ХАРАКТЕРИСТИКИ */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3 border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">OE Номер</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs shadow-sm">
                    {product.oe || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Стан</span>
                  <span className="font-bold text-slate-800 text-sm uppercase tracking-tight">{product.condition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Категорія</span>
                  <span className="font-bold text-slate-800 text-sm tracking-tight">{product.subcat}</span>
                </div>
              </div>

              {/* ОПИС */}
              <div className="mb-8 border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[10px] mb-3 flex items-center gap-2 opacity-50">
                  Опис деталі
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description || "Оригінальна запчастина з розборки. Деталь перевірена перед зняттям. Гарантія на установку та перевірку. Додаткові фото та відео можемо скинути у Viber/Telegram."}
                </p>
              </div>

              {/* --- БЛОК КОМУНІКАЦІЇ (ORIGINAL BRAND ICONS) --- */}
              <div className="flex flex-col gap-4 mt-6">

                {/* Кнопка Дзвінка */}
                <a
                  href={telLink}
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
                  </svg>
                  Зателефонувати
                </a>

                {/* Ряд оригінальних месенджерів */}
                <div className="grid grid-cols-3 gap-3">

                  {/* Viber — завжди фіолетовий */}
                  <a
                    href={viberLink}
                    className="group flex flex-col items-center justify-center gap-2 bg-white border border-slate-100 py-4 rounded-2xl transition-all duration-300 hover:border-purple-200 hover:bg-purple-50 hover:shadow-md active:scale-95 shadow-sm"
                  >
                    <ViberIcon className="w-8 h-8 text-[#7360f2] transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[10px] font-black text-[#7360f2]/80 uppercase tracking-widest group-hover:text-[#7360f2]">
                      Viber
                    </span>
                  </a>

                  {/* Telegram — завжди блакитний */}
                  <a
                    href={tgLink}
                    target="_blank"
                    className="group flex flex-col items-center justify-center gap-2 bg-white border border-slate-100 py-4 rounded-2xl transition-all duration-300 hover:border-sky-200 hover:bg-sky-50 hover:shadow-md active:scale-95 shadow-sm"
                  >
                    <TelegramIcon className="w-8 h-8 text-[#229ED9] transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[10px] font-black text-[#229ED9]/80 uppercase tracking-widest group-hover:text-[#229ED9]">
                      Telegram
                    </span>
                  </a>

                  {/* WhatsApp — завжди зелений */}
                  <a
                    href={waLink}
                    target="_blank"
                    className="group flex flex-col items-center justify-center gap-2 bg-white border border-slate-100 py-4 rounded-2xl transition-all duration-300 hover:border-green-200 hover:bg-green-50 hover:shadow-md active:scale-95 shadow-sm"
                  >
                    <WhatsAppIcon className="w-8 h-8 text-[#25D366] transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[10px] font-black text-[#25D366]/80 uppercase tracking-widest group-hover:text-[#25D366]">
                      WhatsApp
                    </span>
                  </a>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}