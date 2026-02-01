"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { dummyProducts } from '../utils/inventoryData';

// --- ІМПОРТУЄМО НАШІ НОВІ ІКОНКИ ---
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import Link from 'next/link'; // <--- Додати
import { useCart } from '@/context/CartContext'; // <--- Додати

export default function Header() {
  const { cart } = useCart();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  // Реальний номер твого брата
  const phoneNumber = "380681374018";

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = (searchQuery) => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;
    setShowSuggestions(false);
    setIsMenuOpen(false);
    router.push(`/?search=${encodeURIComponent(cleanQuery)}`);
  };

  return (
    <header className="sticky top-0 z-[100] shadow-sm font-sans bg-white">
      {/* ПОВЕРХ 1: ІНФОРМАЦІЙНИЙ */}
      <div className="bg-slate-900 text-white py-2 px-4 border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-y-2 text-[10px] md:text-xs">
          <div className="flex items-center gap-x-4">
            <span className="flex items-center gap-1.5 opacity-90">
              <span className="text-blue-400">📍</span> м. Горохів
            </span>
            <span className="flex items-center gap-1.5 opacity-90 border-l border-white/20 pl-4 font-bold">
              <span className="text-blue-400">⌚</span> Пн-Сб 09:00 — 20:00
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 uppercase tracking-widest font-bold text-[10px]">
            <a href="/shipping" className="hover:text-blue-400 transition-colors">Оплата і доставка</a>
            <a href="/warranty" className="hover:text-blue-400 transition-colors">Гарантія</a>
            <a href="/about" className="hover:text-blue-400 transition-colors">Про нас</a>
          </nav>
        </div>
      </div>

      {/* ПОВЕРХ 2: ОСНОВНИЙ */}
      <div className="bg-white border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center gap-3">

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 text-slate-600 bg-slate-50 rounded-lg">
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>

          {/* ЛОГОТИП: Прихований на мобільних, щоб дати місце пошуку */}
          <div className="hidden md:block text-lg md:text-2xl font-black tracking-tighter text-slate-900 cursor-pointer flex-shrink-0" onClick={() => router.push('/')}>
            АВТО<span className="text-blue-600">ПОРТАЛ</span>
          </div>

          {/* --- БЛОК ПОШУКУ (Header.js) --- */}
          <div className="flex-grow relative" ref={wrapperRef}>
            <div className="relative group">
              <input
                type="text"
                placeholder="Пошук запчастини..."
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (val.length > 1) {
                    const filtered = dummyProducts.filter(p =>
                      p.name.toLowerCase().includes(val.toLowerCase()) ||
                      p.oe.toLowerCase().includes(val.toLowerCase())
                    ).slice(0, 5);
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
                className="w-full h-11 md:h-12 pl-4 pr-12 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-bold text-slate-900"
              />

              <button
                onClick={() => performSearch(query)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* --- ПІДКАЗКИ ПОШУКУ (ЕФЕКТ ШТОРИ) --- */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-white shadow-2xl overflow-hidden z-[9999] animate-in slide-in-from-top-full duration-300 fixed top-[96px] left-0 w-full rounded-b-3xl border-t border-slate-100 md:absolute md:top-full md:mt-2 md:w-full md:rounded-2xl md:border md:left-0 md:fixed-none">

                {/* Шапка для мобілок */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center md:hidden">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Результати пошуку</span>
                  <button onClick={() => setShowSuggestions(false)} className="text-slate-500 p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Список деталей */}
                <div className="max-h-[70vh] md:max-h-[400px] overflow-y-auto">
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setQuery(p.name); performSearch(p.name); }}
                      className="px-6 py-5 md:py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-4 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      {/* Прев'ю */}
                      <div className="w-14 h-14 md:w-10 md:h-10 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden shadow-sm border border-slate-200">
                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                      </div>

                      {/* Текст */}
                      <div className="flex-grow min-w-0 text-left">
                        <div className="text-base md:text-sm font-black text-slate-900 truncate leading-tight">{p.name}</div>
                        <div className="text-[11px] md:text-[10px] font-mono font-bold text-slate-400 uppercase mt-1">OE: {p.oe}</div>
                      </div>

                      {/* Ціна */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-base md:text-sm font-black text-blue-600">{p.price}</div>
                        <div className="text-[9px] font-bold text-emerald-600 uppercase md:hidden">В наявності</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Кнопка "Всі результати" */}
                <button
                  onClick={() => performSearch(query)}
                  className="w-full py-5 bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] md:py-3"
                >
                  Показати всі результати
                </button>
              </div>
            )}
          </div>

          {/* КОНТАКТИ ТА КОШИК */}
          <div className="flex items-center gap-3 md:gap-6 ml-auto">
            <div className="hidden lg:flex items-center gap-4 border-l border-gray-100 pl-6">
              <div className="flex flex-col items-end leading-tight mr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Маєте питання?</span>
                <span className="text-sm font-black text-slate-900 whitespace-nowrap">+38 068 137 40 18</span>
              </div>
              <div className="flex gap-2">
                {/* Viber */}
                <a href={`viber://chat?number=%2B${phoneNumber}`} className="text-[#7360f2] hover:scale-110 transition-transform">
                  <ViberIcon className="w-7 h-7" />
                </a>
                {/* WhatsApp */}
                <a href={`https://wa.me/${phoneNumber}`} target="_blank" className="text-[#25D366] hover:scale-110 transition-transform">
                  <WhatsAppIcon className="w-7 h-7" />
                </a>
                {/* Telegram */}
                <a href={`https://t.me/+${phoneNumber}`} target="_blank" className="text-[#229ED9] hover:scale-110 transition-transform">
                  <TelegramIcon className="w-7 h-7" />
                </a>
              </div>
            </div>

            <Link href="/cart" className="relative p-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-xl transition-all group">
              {/* Иконка корзины (твоя, в виде пакета) */}
              <svg className="w-6 h-6 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>

              {/* Красная цифра (появляется только если есть товары) */}
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Мобільне меню (НОВЕ: Іконки + Месенджери) */}
      {isMenuOpen && (
        <>
          {/* Фон (Backdrop) */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)} />

          {/* Саме меню */}
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 py-6 px-6 z-50 md:hidden animate-in slide-in-from-top duration-300 shadow-2xl rounded-b-[2rem]">

            {/* Навігація */}
            <nav className="flex flex-col gap-2">
              <a href="/shipping" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group" onClick={() => setIsMenuOpen(false)}>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {/* Іконка Вантажівки */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Оплата і доставка</span>
              </a>

              <a href="/warranty" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group" onClick={() => setIsMenuOpen(false)}>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {/* Іконка Щита */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Гарантія</span>
              </a>

              <a href="/about" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group" onClick={() => setIsMenuOpen(false)}>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {/* Іконка Інфо */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Про нас</span>
              </a>
            </nav>

            {/* Блок контактів (М'ЯСО) */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Зв'язатися з нами</p>
              <div className="grid grid-cols-3 gap-3">
                <a href={`viber://chat?number=%2B${phoneNumber}`} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-[#7360f2] hover:text-white transition-all group">
                  <ViberIcon className="w-6 h-6 text-[#7360f2] group-hover:text-white" />
                  <span className="text-[10px] font-bold">Viber</span>
                </a>
                <a href={`https://t.me/+${phoneNumber}`} target="_blank" className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-[#229ED9] hover:text-white transition-all group">
                  <TelegramIcon className="w-6 h-6 text-[#229ED9] group-hover:text-white" />
                  <span className="text-[10px] font-bold">Telegram</span>
                </a>
                <a href={`https://wa.me/${phoneNumber}`} target="_blank" className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-[#25D366] hover:text-white transition-all group">
                  <WhatsAppIcon className="w-6 h-6 text-[#25D366] group-hover:text-white" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </a>
              </div>
              <a href={`tel:+${phoneNumber}`} className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Подзвонити
              </a>
            </div>

          </div>
        </>
      )}
    </header>
  );
}