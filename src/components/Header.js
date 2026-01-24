"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { dummyProducts } from '../utils/inventoryData';

export default function Header() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  const phoneNumber = "380680000000"; // Номер твого брата

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
              <span className="text-blue-400">📍</span> с. Борочиче, вул. Шевченка, 55
            </span>
            <span className="flex items-center gap-1.5 opacity-90 border-l border-white/20 pl-4 font-bold">
              <span className="text-blue-400">⌚</span> Пн-Сб 09:00 — 18:00
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-blue-400 transition-colors">Доставка</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Гарантія</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Про нас</a>
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

          <div className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 cursor-pointer flex-shrink-0" onClick={() => router.push('/')}>
            АВТО<span className="text-blue-600">ПОРТАЛ</span>
          </div>

          {/* ПОШУК */}
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
                    } else { setShowSuggestions(false); }
                }}
                onKeyDown={(e) => e.key === 'Enter' && performSearch(query)}
                className="w-full h-10 md:h-12 pl-4 pr-12 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-bold text-slate-900"
              />
              <button onClick={() => performSearch(query)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

            {/* Підказки пошуку */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[110]">
                {suggestions.map((p) => (
                  <div key={p.id} onClick={() => { setQuery(p.name); performSearch(p.name); }} className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 font-bold">
                    <img src={p.image} className="w-10 h-10 rounded bg-slate-100 object-cover" alt="" />
                    <div className="flex-grow min-w-0">
                      <div className="text-xs text-slate-800 truncate">{p.name}</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase">OE: {p.oe}</div>
                    </div>
                    <div className="text-xs font-black text-blue-600">{p.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* КОНТАКТИ ТА КОШИК */}
          <div className="flex items-center gap-3 md:gap-6 ml-auto">
            <div className="hidden lg:flex items-center gap-4 border-l border-gray-100 pl-6">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Зв'язок</span>
                <span className="text-sm font-black text-slate-900 whitespace-nowrap">+38 068 000 00 00</span>
              </div>
              <div className="flex gap-1.5">
                {/* Viber */}
                <a href={`viber://chat?number=${phoneNumber}`} className="w-8 h-8 rounded-full bg-[#7360f2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.57 21a4.52 4.52 0 0 1-1.07-.13c-2.8-.73-5.5-2.65-7.7-5.54a14.7 14.7 0 0 1-3.2-6.1c-.26-1.12.06-2.22.88-3.04l.52-.52A2.3 2.3 0 0 1 8.54 5c.4 0 .78.15 1.07.44l2.12 2.12c.3.3.44.68.44 1.07s-.15.77-.44 1.07l-.65.65c.4.74.88 1.45 1.45 2.1a9.23 9.23 0 0 0 2.2 1.7l.6-.6c.3-.3.68-.44 1.07-.44s.77.15 1.07.44l2.12 2.12c.6.6.6 1.55 0 2.12l-.53.53a3.3 3.3 0 0 1-1.36.85z" /></svg>
                </a>
                {/* ПОВЕРНУЛИ WhatsApp */}
                <a href={`https://wa.me/${phoneNumber}`} className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
                {/* Telegram */}
                <a href={`https://t.me/+${phoneNumber}`} className="w-8 h-8 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" /></svg>
                </a>
              </div>
            </div>

            <button className="relative p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Мобільне меню + Backdrop */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 py-6 px-8 z-50 md:hidden animate-in slide-in-from-top duration-300 shadow-2xl">
            <nav className="flex flex-col gap-6 font-black text-slate-800 uppercase tracking-widest text-sm">
              <a href="#" className="flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>Доставка <span className="text-blue-600">→</span></a>
              <a href="#" className="flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>Гарантія <span className="text-blue-600">→</span></a>
              <a href="#" className="flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>Про нас <span className="text-blue-600">→</span></a>
              <a href="#" className="flex items-center justify-between text-blue-600" onClick={() => setIsMenuOpen(false)}>Контакти <span className="text-blue-600">→</span></a>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}