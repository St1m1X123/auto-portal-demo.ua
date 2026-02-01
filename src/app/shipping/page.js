import React from 'react';

export default function ShippingPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Заголовок сторінки */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Доставка та <span className="text-blue-600">оплата</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Усе, що вам потрібно знати про отримання та перевірку запчастин
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto py-12 px-4 space-y-12">
        
        {/* Блок: Доставка */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">🚚</div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Способи доставки</h2>
          </div>
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <div>
              <h3 className="font-black text-slate-800 uppercase text-sm mb-2">Нова Пошта</h3>
              <p>Відправляємо замовлення щодня по всій Україні. Якщо ви оформили замовлення до 14:00, запчастина поїде до вас того ж дня.</p>
            </div>
            <div className="pt-4 border-t border-gray-50">
              <h3 className="font-black text-slate-800 uppercase text-sm mb-2">Самовивіз зі складу</h3>
              <p>Самовивіз доступний у <strong>м. Горохів (Волинська обл.)</strong>. Перед візитом обов'язково зателефонуйте, щоб ми підготували деталь.</p>
            </div>
          </div>
        </section>

        {/* Блок: Оплата */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">💳</div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Варіанти оплати</h2>
          </div>
          <div className="space-y-6 text-slate-600">
            <div className="flex gap-4">
              <div className="font-black text-blue-600 shrink-0">01.</div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-sm mb-1">Післяплата (Наложка)</h3>
                <p>Оплата при отриманні у відділенні Нової Пошти. Ми беремо символічну передплату у розмірі вартості доставки (200-500 грн), яка вираховується із загальної суми.</p>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-gray-50">
              <div className="font-black text-blue-600 shrink-0">02.</div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-sm mb-1">Повна передплата</h3>
                <p>Оплата на карту ПриватБанку або Монобанку. Це дозволяє вам не переплачувати комісію Нової Пошти за переказ коштів.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Блок: Гарантія */}
        <section className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🛡️</div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Гарантія на перевірку</h2>
          </div>
          <p className="text-slate-300 mb-6 leading-relaxed">
            Ми розуміємо, що запчастини вживані, тому надаємо <strong>14 днів</strong> з моменту отримання на встановлення та перевірку працездатності деталі.
          </p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm italic text-slate-400">
            * У разі повернення, транспортні витрати оплачує покупець. Деталь має бути без пошкоджень та з нашими мітками.
          </div>
        </section>

      </main>
    </div>
  );
}