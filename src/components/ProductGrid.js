import React, { useState } from 'react';
import Link from 'next/link'; // <--- 1. Додали імпорт для посилань
import { useCart } from '@/context/CartContext';

export default function ProductGrid({
    categoryName,
    globalSearchQuery,
    onBack,
    hideHeader = false,
    products = []
}) {
    const { addToCart, cart } = useCart();
    const [activeChip, setActiveChip] = useState('Всі');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const isSelectedInCart = selectedProduct && cart.some((item) => item.id === selectedProduct.id);

    // 1. СПОЧАТКУ ОГОЛОШУЄМО ДЖЕРЕЛО ДАНИХ (Це важливо!)
    const productsSource = products;

    const isAllPartsMode = categoryName === 'Всі запчастини';

    // 2. ТЕПЕР РАХУЄМО ЧІПСИ (Тепер productsSource вже існує і код не зламається)
    const dynamicSubcats = isAllPartsMode
        ? []
        : [...new Set(
            productsSource
                .filter(p => {
                    const pCat = p.category || p.cat || "";
                    // Приводим всё к нижнему регистру и убираем лишние пробелы
                    const pModels = String(p.models || "").toLowerCase().trim();
                    const target = categoryName.toLowerCase().trim();

                    return pCat === categoryName ||
                        pModels.includes(target) ||
                        pModels.includes("*");
                })
                .map(p => p.subcat)
        )].filter(Boolean).sort();

    // 3. ФОРМУЄМО СПИСОК КНОПОК
    const allChips = isAllPartsMode ? [] : ['Всі', ...dynamicSubcats];
    const MAX_MOBILE_VISIBLE = 4;
    const hiddenCount = Math.max(0, allChips.length - MAX_MOBILE_VISIBLE);

    // 4. ФІНАЛЬНИЙ ФІЛЬТР (Виправлено завдяки твоїй знахідці)
    const filteredProducts = productsSource.filter(p => {
        // Підготовка даних
        const pModels = String(p.models || p.model || "").toLowerCase().trim();
        const pName = p.name.toLowerCase().trim();
        const pOe = (p.oe || "").toLowerCase().trim();
        const searchLower = (globalSearchQuery || "").toLowerCase().trim();
        const categoryTarget = categoryName.toLowerCase().trim();

        // 1. Універсальні товари (Масло, хімія)
        // Шукаємо: "всі", "777", "*" або "universal"
        const isUniversal = pModels.includes("всі") || pModels.includes("*") || pModels.includes("777");

        // 2. Логіка Категорії / Моделі
        // Чи підходить цей товар під обрану плитку (наприклад "Astra G")?
        const isModelMatch = pModels.includes(categoryTarget);

        const categoryMatch =
            categoryName === 'Всі запчастини' ||
            (p.category || "").toLowerCase() === categoryTarget ||
            isModelMatch ||  // <--- Головна перевірка моделі
            isUniversal;     // <--- Головна перевірка масла

        // 3. Логіка Пошуку (ОСЬ ТУТ БУЛА ПРОБЛЕМА!)
        // Якщо пошуку немає — все ок.
        // Якщо пошук Є, то товар підходить, ЯКЩО:
        // АБО слово є в назві
        // АБО слово є в номері запчастини (OE)
        // АБО (УВАГА!) слово знайдено в списку МОДЕЛЕЙ (pModels) <--- МИ ДОДАЛИ ЦЕ!
        const matchesSearch = !globalSearchQuery ||
            pName.includes(searchLower) ||
            pOe.includes(searchLower) ||
            pModels.includes(searchLower) || // <--- ОСЬ ЦЕ ВИРІШУЄ ПРОБЛЕМУ!
            (isUniversal && isModelMatch);   // Масло покажеться, якщо ми в правильній моделі

        // 4. Логіка Чіпсів
        const subcatMatch = (!!globalSearchQuery) || activeChip === 'Всі' || p.subcat === activeChip;

        return categoryMatch && subcatMatch && matchesSearch;
    });

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    // 2. ВИВЕДЕННЯ
    return (
        <section className="py-6 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Заголовок та кнопка "Назад" */}
                {!hideHeader && (
                    <div className="mb-6 flex items-center gap-4">
                        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                            Назад
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            {categoryName.toUpperCase()}
                        </h2>
                    </div>
                )}

                {/* Блок чіпсів */}
                {allChips.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                        {allChips.map((chip, index) => {
                            const isHiddenOnMobile = index >= MAX_MOBILE_VISIBLE && !isExpanded;
                            return (
                                <button
                                    key={chip}
                                    onClick={() => { setActiveChip(chip); setIsExpanded(false); }}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm active:scale-95 ${isHiddenOnMobile ? 'hidden md:inline-flex' : 'inline-flex'} ${activeChip === chip ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    {chip}
                                </button>
                            );
                        })}
                        {!isExpanded && hiddenCount > 0 && (
                            <button onClick={() => setIsExpanded(true)} className="md:hidden px-4 py-2 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95">
                                Ще {hiddenCount} ▼
                            </button>
                        )}
                        {isExpanded && hiddenCount > 0 && (
                            <button onClick={() => setIsExpanded(false)} className="md:hidden px-4 py-2 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95">
                                Згорнути ▲
                            </button>
                        )}
                    </div>
                )}

                {/* СПИСОК ТОВАРІВ */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Нічого не знайдено</p>
                        <p className="text-sm text-slate-500 mt-2">
                            За запитом <span className="text-blue-600 font-bold">"{globalSearchQuery}"</span> товарів немає. <br />
                            Спробуйте змінити запит або OE номер.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col group">

                                {/* 2. ФОТО ТЕПЕР ПОСИЛАННЯ */}
                                <Link href={`/product/${product.id}`} className="block">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden cursor-pointer">
                                        <img
                                            loading="lazy"
                                            src={
                                                (product.images && product.images[0] && product.images[0].startsWith('http'))
                                                    ? product.images[0]
                                                    : (product.image && product.image.startsWith('http'))
                                                        ? product.image
                                                        : 'https://placehold.co/400x300?text=No+Image'
                                            }
                                            alt={product.name || 'Товар'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                                                {product.condition}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Інфо */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.subcat}</span>
                                    </div>

                                    {/* 3. НАЗВА ТЕПЕР ПОСИЛАННЯ */}
                                    <Link href={`/product/${product.id}`} className="block hover:text-blue-600 transition-colors">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2 min-h-[40px]">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">OE Номер:</p>
                                        <p className="text-xs font-mono font-bold text-slate-700 tracking-wider uppercase">
                                            {product.oe || 'не вказано'}
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        {/* ЦЕННИК: Синяя цена в грн и зеленый статус */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Ціна</span>
                                                {/* Фарбуємо в синій, а "грн" підтягнеться з даних автоматично */}
                                                <span className="text-xl font-black text-blue-600 leading-none">{product.price}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-emerald-600 uppercase bg-white px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">
                                                В наявності
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Кнопка Купить */}
                                            <div className="flex-grow">
                                                <button
                                                    onClick={() => handleBuyClick(product)}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md shadow-blue-100 uppercase"
                                                >
                                                    Купити
                                                </button>
                                            </div>

                                            {/* ЗЕЛЕНЫЙ ТЕЛЕФОН: Используем чистый SVG с зеленым цветом */}
                                            <a
                                                href={`tel:380681374018`}
                                                className="flex items-center justify-center w-12 h-12 border-2 border-emerald-500 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                                title="Зателефонувати"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- ОНОВЛЕНЕ МОДАЛЬНЕ ВІКНО: СИНЯ ЦІНА + ЗЕЛЕНИЙ СТАТУС --- */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 font-montserrat">
                    {/* Фон із розмиттям */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />

                    {/* Контейнер вікна */}
                    <div className="relative bg-white w-full max-w-5xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[98vh] overflow-hidden flex flex-col md:flex-row">

                        {/* ЛІВА ЧАСТИНА (Тільки для комп'ютера) */}
                        <div className="hidden md:flex md:w-[35%] bg-slate-50 p-10 flex-col justify-center border-r border-slate-100">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Ваше замовлення</p>
                            <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 mb-6">
                                <img
                                    loading="lazy"
                                    src={(selectedProduct.images && selectedProduct.images[0]) ? selectedProduct.images[0] : (selectedProduct.image || 'https://placehold.co/400x300?text=No+Image')}
                                    alt={selectedProduct.name || 'Запчастина'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2">{selectedProduct.name}</h3>
                            <div className="flex items-center gap-2">
                                {/* Тільки selectedProduct.price, без додавання " грн" */}
                                <span className="text-2xl font-black text-blue-600 tracking-tighter">{selectedProduct.price}</span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">В наявності</span>
                            </div>
                        </div>

                        {/* ПРАВА ЧАСТИНА (Форма) */}
                        <div className="w-full md:w-[65%] p-5 md:p-10 overflow-y-auto">

                            {/* Мобільне прев'ю (ховається на десктопі) */}
                            <div className="md:hidden flex items-center gap-3 mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                    <img
                                        src={(selectedProduct.images && selectedProduct.images[0]) || selectedProduct.image}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-[11px] font-black text-slate-800 uppercase truncate">{selectedProduct.name}</h4>
                                    {/* Тут теж прибираємо зайве " грн" */}
                                    <p className="text-blue-600 font-black text-sm">{selectedProduct.price}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Секція 1: Контакти */}
                                <div className="space-y-3">
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Контактні дані</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="text" placeholder="Прізвище та Ім'я" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" />
                                        <input type="tel" placeholder="Номер телефону" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>

                                {/* Секція 2: Доставка */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-200 pl-3">Доставка (Нова Пошта)</h4>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">Необов'язково</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="Місто" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" />
                                        <input type="text" placeholder="Відділення №" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>

                                {/* Секція 3: Примітка */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-slate-200 pl-3">Додаткова інформація</h4>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">Необов'язково</span>
                                    </div>
                                    <textarea rows="1" placeholder="VIN-код або примітка..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all resize-none"></textarea>
                                </div>

                                {/* Блок сумісності / консультації */}
                                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                                    <p className="text-[10px] text-emerald-700 font-bold leading-tight">
                                        🤝 Бажаєте консультацію? Просто напишіть ім'я та телефон, і ми вам зателефонуємо, щоб допомогти з підбором!
                                    </p>
                                </div>

                                {/* Кнопки */}
                                <div className="flex flex-col gap-2 pt-2">
                                    <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-95 hover:bg-blue-700 transition-all">
                                        Підтвердити замовлення
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!isSelectedInCart) addToCart(selectedProduct);
                                            setShowModal(false);
                                        }}
                                        disabled={isSelectedInCart}
                                        className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${
                                            isSelectedInCart
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                                                : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                                        }`}
                                    >
                                        {isSelectedInCart ? 'Додано до кошику' : 'Додати та продовжити вибір'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Кнопка закриття */}
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}