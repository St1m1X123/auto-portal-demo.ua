import React from 'react';
import ViberIcon from './icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

export default function Footer() {
  const phoneNumber = "380681374018";

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
        
        <div>
          <div className="text-2xl font-black tracking-tight text-white mb-6">
            АВТО<span className="text-blue-600">ПОРТАЛ</span>
          </div>
          <p className="text-sm leading-relaxed font-medium">
            Спеціалізована розборка та продаж оригінальних вживаних запчастин Opel. Усі деталі проходять перевірку перед продажем. Доставка по Україні.
          </p>
        </div>

        <div>
          <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Каталог</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li><a href="/?brand=Opel" className="hover:text-blue-500 transition-colors">Запчастини Opel</a></li>
            <li><a href="/" className="hover:text-blue-500 transition-colors">Усі категорії</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Клієнтам</h4>
          <ul className="space-y-3 text-sm font-bold">
            <li><a href="/shipping" className="hover:text-blue-500 transition-colors">Оплата і доставка</a></li>
            <li><a href="/warranty" className="hover:text-blue-500 transition-colors">Гарантія</a></li>
            <li><a href="/about" className="hover:text-blue-500 transition-colors">Про нас</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Зв'язок</h4>
          
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Телефон</p>
            <a href={`tel:+${phoneNumber}`} className="text-lg font-black text-white hover:text-blue-500 transition-colors">
              +38 068 137 40 18
            </a>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Склад</p>
            <p className="text-sm font-bold text-white">м. Горохів</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Графік роботи</p>
            <p className="text-sm font-bold text-white">Пн-Сб 09:00 — 18:00</p>
          </div>

          <div className="flex gap-4 pt-2">
            <a href={`viber://chat?number=%2B${phoneNumber}`} className="text-slate-400 hover:text-[#7360f2] transition-colors">
              <ViberIcon className="w-6 h-6" />
            </a>
            <a href={`https://t.me/+${phoneNumber}`} className="text-slate-400 hover:text-[#229ED9] transition-colors">
              <TelegramIcon className="w-6 h-6" />
            </a>
            <a href={`https://wa.me/${phoneNumber}`} className="text-slate-400 hover:text-[#25D366] transition-colors">
              <WhatsAppIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
        <p>© 2026 АВТОПОРТАЛ. Всі права захищені.</p>
        <div className="flex gap-6 opacity-50">
          <a href="#" className="hover:opacity-100 transition-opacity">Політика конфіденційності</a>
        </div>
      </div>
    </footer>
  );
}