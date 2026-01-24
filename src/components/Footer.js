export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-black mb-4">АВТО<span className="text-blue-500">ПОРТАЛ</span></div>
          <p className="text-slate-400 text-sm">Професійна розборка та продаж запчастин по всій Україні.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Каталог</h4>
          <ul className="text-slate-400 text-sm space-y-2">
            <li><a href="#" className="hover:text-white">Opel</a></li>
            <li><a href="#" className="hover:text-white">Honda</a></li>
            <li><a href="#" className="hover:text-white">Mitsubishi</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Клієнтам</h4>
          <ul className="text-slate-400 text-sm space-y-2">
            <li><a href="#" className="hover:text-white">Доставка</a></li>
            <li><a href="#" className="hover:text-white">Гарантія</a></li>
            <li><a href="#" className="hover:text-white">Контакти</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Зв'язок</h4>
          <p className="text-slate-400 text-sm mb-2">Працюємо: Пн-Сб 9:00 - 18:00</p>
          <p className="font-bold">+38 (0XX) XXX-XX-XX</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-xs">
        © 2026 Автопортал. Всі права захищені.
      </div>
    </footer>
  );
}