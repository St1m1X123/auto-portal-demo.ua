import React from 'react';

export default function WarrantyPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Заголовок */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Гарантія та <span className="text-blue-600">повернення</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Прозорі умови перевірки запчастин для вашого спокою
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        
        {/* Основные условия */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="text-blue-600">01.</span> Термін перевірки
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            На всі вживані запчастини надається термін для встановлення та перевірки працездатності — <strong>14 днів</strong> з моменту отримання товару у відділенні «Нової Пошти» або самовивозу зі складу.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm font-bold">
            Важливо: Для двигунів та коробок передач умови обговорюються індивідуально перед покупкою.
          </div>
        </section>

        {/* Маркировка */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="text-blue-600">02.</span> Збереження міток
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Всі наші запчастини мають спеціальні захисні мітки (маркування фарбою або насічки). Повернення або обмін можливі лише за умови, що ці мітки <strong>не були пошкоджені, стерті або розкриті</strong>. Будь-яке втручання в цілісність деталі анулює гарантію.
          </p>
        </section>

        {/* Что не подлежит возврату */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="text-blue-600">03.</span> Обмеження
          </h2>
          <ul className="space-y-4 text-slate-600">
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">✕</span>
              <span>Відрізні кузовні частини (чверті, лонжерони, пороги), які були відрізані під замовлення клієнта, поверненню не підлягають.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">✕</span>
              <span>Запчастини, які були пошкоджені внаслідок неправильного встановлення або експлуатації.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">✕</span>
              <span>Витратні матеріали (прокладки, сальники, фільтри, рідини).</span>
            </li>
          </ul>
        </section>

        {/* Процесс возврата */}
        <section className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Як оформити повернення?</h2>
          <div className="space-y-4 text-slate-300">
            <p>1. Зв'яжіться з нами за телефоном або у месенджерах для погодження повернення.</p>
            <p>2. Надішліть деталь «Новою Поштою» (транспортні витрати оплачує покупець).</p>
            <p>3. Після отримання та перевірки цілісності міток ми повертаємо кошти на вашу карту протягом 1-3 робочих днів.</p>
          </div>
        </section>

      </main>
    </div>
  );
}