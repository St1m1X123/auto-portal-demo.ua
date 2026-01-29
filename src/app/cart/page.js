"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, totalAmount } = useCart();
  const router = useRouter();

  // Якщо кошик порожній
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-montserrat p-4 text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase">Ваш кошик порожній</h1>
        <p className="text-slate-500 mb-8 max-w-md">Здається, ви ще нічого не обрали. Перегляньте наш каталог, там багато цікавого!</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-montserrat pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* ЗАГОЛОВОК З ІКОНКОЮ */}
        <h1 className="text-2xl font-black text-slate-900 uppercase mb-8 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Ваш кошик <span className="text-slate-400 text-lg">({cart.length})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ЛІВА КОЛОНКА: СПИСОК ТОВАРІВ */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center group hover:border-blue-100 transition-colors">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-black text-slate-800 uppercase truncate text-sm mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OE:</span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{item.oe || '—'}</span>
                  </div>
                  <p className="text-blue-600 font-black text-lg">{item.price}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Видалити"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
            
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider hover:text-blue-600 mt-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Продовжити покупки
            </Link>
          </div>

          {/* ПРАВА КОЛОНКА: ОФОРМЛЕННЯ */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100">
              <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1">Разом до сплати</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                  {totalAmount} <span className="text-xl text-slate-400 font-bold">грн</span>
                </span>
              </div>

              {/* ФОРМА */}
              <div className="space-y-5">
                
                {/* Блок Контакти */}
                <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest pl-1">Ваші контакти</h4>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Прізвище та Ім'я" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                        />
                        <input 
                            type="tel" 
                            placeholder="Номер телефону" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                        />
                    </div>
                </div>
                
                {/* Блок Доставка */}
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest pl-1">Доставка (Нова Пошта)</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">Необов'язково</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="text" 
                            placeholder="Місто" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                        />
                        <input 
                            type="text" 
                            placeholder="Відділення №" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                        />
                    </div>
                </div>

                {/* Блок Примітка (ВИПРАВЛЕНО) */}
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                        {/* ТУТ БУВ ЧОРНИЙ КОЛІР І СМУЖКА */}
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest pl-1">Примітка / VIN</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">Необов'язково</span>
                    </div>
                    <textarea 
                        rows="2" 
                        placeholder="Напишіть VIN-код для перевірки або примітку..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none"
                    ></textarea>
                </div>

                <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.15em] shadow-xl shadow-blue-100 active:scale-95 hover:bg-blue-700 transition-all mt-4">
                  Підтвердити замовлення
                </button>
                
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-2">
                  Менеджер зв'яжеться для уточнення деталей
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}