"use client";

import React, { useState, useEffect, useRef } from 'react';
// Імпортуємо наші нові ідеальні іконки
import ViberIcon from '@/components/icons/ViberIcon';
import TelegramIcon from '@/components/icons/TelegramIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Оновлений номер брата для Opel.Shrot
  const phoneNumber = "380681374018";

  // Закриваємо меню при кліку в будь-якому іншому місці
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      className="md:hidden fixed right-6 flex flex-col items-center gap-3 z-[9999]"
      style={{ bottom: 'var(--floating-bottom, 24px)' }}
    >

      {/* ПАНЕЛЬ МЕСЕНДЖЕРІВ */}
      <div className={`flex flex-col gap-4 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
        }`}>

        {/* Viber */}
        <a
          href={`viber://chat?number=%2B${phoneNumber}`}
          className="w-13 h-13 bg-white text-[#7360f2] rounded-full flex items-center justify-center shadow-xl border border-purple-100 active:scale-90 transition-transform p-3"
        >
          <ViberIcon className="w-7 h-7" />
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${phoneNumber}`}
          target="_blank"
          className="w-13 h-13 bg-white text-[#25D366] rounded-full flex items-center justify-center shadow-xl border border-green-100 active:scale-90 transition-transform p-3"
        >
          <WhatsAppIcon className="w-7 h-7" />
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/+${phoneNumber}`}
          target="_blank"
          className="w-13 h-13 bg-white text-[#229ED9] rounded-full flex items-center justify-center shadow-xl border border-sky-100 active:scale-90 transition-transform p-3"
        >
          <TelegramIcon className="w-7 h-7" />
        </a>
      </div>

      {/* ГОЛОВНА КНОПКА (Тригер) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-slate-800 rotate-[360deg]' : 'bg-blue-600 shadow-blue-300 animate-bounce-subtle'
          } text-white`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}