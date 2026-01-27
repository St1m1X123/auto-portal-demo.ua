import React from 'react';
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

export default function AboutPage() {
  const phoneNumber = "380681374018";

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* Hero Section - Візуальна частина */}
      <section className="relative py-24 px-4 bg-slate-900 overflow-hidden text-center">
        {/* Фоновий декор (замість фото складу) */}
        <div className="absolute inset-0 opacity-20 grayscale">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-slate-900" />
          {/* Тут клієнт уявить склад :) */}
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Експертний підхід</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase">
            Авто<span className="text-blue-600">Портал</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Ми не просто продаємо запчастини. Ми даємо друге життя вашому Opel, пропонуючи перевірені деталі за справедливу ціну.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-16 px-4">
        
        {/* Блок з цифрами */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-20">
          {[
            { label: "Запчастин у наявності", value: "5000+" },
            { label: "Років на ринку", value: "5+" },
            { label: "Марок у роботі", value: "OPEL" },
            { label: "Місто складу", value: "ГОРОХІВ" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="text-2xl md:text-3xl font-black text-blue-600 mb-1">{stat.value}</div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Основний текст */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Хто ми такі?</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>АвтоПортал</strong> — це спеціалізований майданчик з продажу оригінальних вживаних запчастин для автомобілів марки Opel. Наш склад знаходиться у <strong>м. Горохів</strong>, де ми власноруч відбираємо та перевіряємо кожну деталь.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Ми розуміємо, що кожен власник Opel шукає надійність. Тому ми фокусуємося на технічному стані: двигуни, коробки передач, електроніка та кузовні елементи — все проходить візуальний огляд та тестування перед продажем.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-blue-600 text-xl font-bold">✓</div>
              <p className="text-sm font-bold text-slate-700 uppercase">Працюємо чесно: якщо деталь має дефект — ми скажемо про це одразу.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-blue-600 text-xl font-bold">✓</div>
              <p className="text-sm font-bold text-slate-700 uppercase">Власний склад у Горохові дозволяє відправляти деталі в день замовлення.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-blue-600 text-xl font-bold">✓</div>
              <p className="text-sm font-bold text-slate-700 uppercase">Ми знаємо специфіку кожної моделі Opel від Astra до Insignia.</p>
            </div>
          </div>
        </div>

        {/* Блок Месенджерів */}
        <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-blue-50 text-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Потрібна консультація?</h2>
          <p className="text-slate-500 mb-8 font-medium">Ми завжди на зв'язку. Напишіть нам у зручний для вас месенджер:</p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a href={`viber://chat?number=%2B${phoneNumber}`} className="flex items-center gap-3 px-6 py-3 bg-[#7360f2] text-white rounded-2xl font-black uppercase text-xs hover:scale-105 transition-transform">
              <ViberIcon className="w-5 h-5 fill-white" /> Viber
            </a>
            <a href={`https://t.me/+${phoneNumber}`} className="flex items-center gap-3 px-6 py-3 bg-[#229ED9] text-white rounded-2xl font-black uppercase text-xs hover:scale-105 transition-transform">
              <TelegramIcon className="w-5 h-5 fill-white" /> Telegram
            </a>
            <a href={`https://wa.me/${phoneNumber}`} className="flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs hover:scale-105 transition-transform">
              <WhatsAppIcon className="w-5 h-5 fill-white" /> WhatsApp
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}