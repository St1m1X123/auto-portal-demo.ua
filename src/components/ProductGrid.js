import React, { useState } from 'react';
import Link from 'next/link'; // <--- 1. Додали імпорт для посилань
import { useCart } from '@/context/CartContext';
import { formatNumber, formatPrice } from '@/utils/format';

export default function ProductGrid({
    categoryName,
    globalSearchQuery,
    onBack,
    hideHeader = false,
    products = [],
    sortBy,
    onSortChange,
    priceRange,
    onPriceChange,
    onOpenVin,
    isLoading = false,
    maxPrice = 100000,
    totalCount,
    viewMode = 'medium',
}) {
    const { addToCart, removeFromCart, cart } = useCart();
    const [activeChip, setActiveChip] = useState('Всі');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // --- SCROLL LOCK ---
    React.useEffect(() => {
        if (showFilters && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showFilters]);

    const handleTouchEnd = () => {
        setIsDragging(false);
        setDragY(0);
    };

    // Скелетон для картки товару
    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-slate-100" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="flex items-center justify-between pt-2">
                    <div className="h-5 bg-slate-100 rounded w-1/4" />
                    <div className="h-8 bg-slate-100 rounded w-1/3" />
                </div>
            </div>
        </div>
    );
    const isSelectedInCart = selectedProduct && cart.some((item) => item.id === selectedProduct.id);

    // Grid classes based on viewMode
    const gridCols = {
        large: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4',
        medium: 'grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-2 md:gap-3',
        small: 'grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 md:gap-2',
    }[viewMode] || 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4';

    // Card styling based on viewMode
    const getCardStyles = (mode) => {
        switch (mode) {
            case 'large': return {
                padding: 'p-2 md:p-3',
                img: 'aspect-square',
                title: 'text-xs md:text-sm min-h-[32px]',
                price: 'text-sm md:text-xl',
                btn: 'h-9 md:h-10 text-[10px] md:text-xs',
                cartBtn: 'w-9 h-9 md:w-10 md:h-10',
                phoneBtn: 'w-9 h-9 md:w-10 md:h-10',
                gap: 'gap-1.5',
                showOe: false,
                showCarInfo: false,
                compact: false
            };
            case 'small': return {
                padding: 'p-1',
                img: 'aspect-square',
                title: 'text-[8px] leading-[1.1] min-h-[16px]',
                price: 'text-[10px] font-black',
                btn: 'h-6 text-[7px]',
                cartBtn: 'w-6 h-6',
                phoneBtn: 'w-6 h-6',
                gap: 'gap-1',
                showOe: false,
                showCarInfo: false,
                compact: false
            };
            case 'medium':
            default: return {
                padding: 'p-1.5 md:p-2',
                img: 'aspect-square',
                title: 'text-[10px] md:text-xs leading-tight min-h-[24px]',
                price: 'text-xs md:text-base',
                btn: 'h-7 md:h-8 text-[8px] md:text-[9px]',
                cartBtn: 'w-7 h-7 md:w-8 md:h-8',
                phoneBtn: 'w-7 h-7 md:w-8 md:h-8',
                gap: 'gap-1',
                showOe: false,
                showCarInfo: false,
                compact: false
            };
        }
    };
    const cStyle = getCardStyles(viewMode);

    // 1. СПОЧАТКУ ОГОЛОШУЄМО ДЖЕРЕЛО ДАНИХ (Це важливо!)
    const productsSource = products;

    const isAllPartsMode = categoryName === 'Всі запчастини';

    // 2. ТЕПЕР РАХУЄМО ЧІПСИ
    const dynamicSubcats = isAllPartsMode
        ? []
        : [...new Set(
            productsSource.map(p => (p.category?.name && p.category.name !== categoryName) ? p.category.name : null)
        )].filter(Boolean).sort();

    // 3. ФОРМУЄМО СПИСОК КНОПОК
    const allChips = isAllPartsMode ? [] : ['Всі', ...dynamicSubcats];
    const MAX_MOBILE_VISIBLE = 4;
    const hiddenCount = Math.max(0, allChips.length - MAX_MOBILE_VISIBLE);

    // 4. ФІНАЛЬНИЙ ФІЛЬТР (Довіряємо продуктам з пропсів, фільтруємо лише по чіпсах)
    const filteredProducts = productsSource.filter(p => {
        if (isAllPartsMode || activeChip === 'Всі') return true;
        return p.category?.name === activeChip;
    });

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCartAction = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        const isInCart = cart.some(item => item.id === product.id);
        if (isInCart) {
            removeFromCart(product.id);
        } else {
            addToCart(product);
        }
    };

    // 2. ВИВЕДЕННЯ
    return (
        <section className="py-0">
            <div>

                {/* Заголовок та кнопка "Назад" */}
                {!hideHeader && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button onClick={onBack} className="flex items-center gap-1.5 text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Назад
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                {categoryName.toUpperCase()}
                            </h2>
                            {totalCount != null && (
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                    {totalCount}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* --- RESPONSIVE FILTERS removed because they are in LeftSidebar now --- */}


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
                {isLoading ? (
                    <div className={`grid ${gridCols}`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
                            🔍
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-3">Запчастину не знайдено?</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-8">
                            На жаль, ми ще не встигли додати цю деталь на сайт. Але ми можемо <span className="text-blue-600 font-bold">знайти її під замовлення</span> за 15 хвилин!
                        </p>
                        <button
                            onClick={onOpenVin}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95"
                        >
                            Замовити підбір
                        </button>

                        {globalSearchQuery && (
                            <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                Пошук за запитом: "{globalSearchQuery}"
                            </p>
                        )}
                    </div>
                ) : (
                    <div className={`grid ${gridCols}`}>
                        {filteredProducts.map((product) => {
                            const isInCart = cart.some(item => item.id === product.id);
                            return (
                                <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    {/* Фото */}
                                    <Link href={`/product/${product.id}`} className="block relative">
                                        <div className={`${cStyle.img} bg-gray-100 relative overflow-hidden cursor-pointer w-full`}>
                                            <img
                                                loading="lazy"
                                                src={
                                                    ((product.images && typeof product.images[0] === 'string' && product.images[0].trim() !== '') && product.images[0].startsWith('http'))
                                                        ? product.images[0]
                                                        : ((product.main_image && typeof product.main_image === 'string' && product.main_image.trim() !== '') && product.main_image.startsWith('http'))
                                                            ? product.main_image
                                                            : 'https://placehold.co/400x400?text=No+Image'
                                                }
                                                alt={product.name || 'Товар'}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-1 right-1 z-10">
                                                <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-black px-1 py-0.5 rounded shadow-sm uppercase">
                                                    {product.condition}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Інфо */}
                                    <div className={`${cStyle.padding} flex flex-col flex-grow bg-white`}>
                                        <Link href={`/product/${product.id}`} className="block hover:text-blue-600 transition-colors mb-0.5">
                                            <h3 className={`${cStyle.title} font-bold text-slate-800 line-clamp-2 leading-tight`}>
                                                {product.name}
                                            </h3>
                                        </Link>

                                        {cStyle.showCarInfo && (
                                            <div className="mb-1.5 flex flex-wrap gap-1">
                                                <span className="text-[8px] md:text-[9px] font-black uppercase text-blue-600/70">{product.car_brand}</span>
                                                {product.compatible_models?.slice(0, 2).map(m => (
                                                    <span key={m} className="text-[8px] md:text-[9px] font-bold text-slate-400 capitalize">{m}</span>
                                                ))}
                                            </div>
                                        )}

                                        {cStyle.showOe && product.oe_number && (
                                            <p className="text-[8px] md:text-[9px] font-mono text-slate-400 mb-1.5 truncate">
                                                OE: <span className="text-slate-600 font-bold">{product.oe_number}</span>
                                            </p>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`${cStyle.price} font-black text-blue-600 leading-none tracking-tighter`}>
                                                    {formatNumber(product.price)}
                                                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 ml-0.5 uppercase">грн</span>
                                                </span>
                                            </div>

                                            <div className={`flex items-center ${cStyle.gap}`}>
                                                {!cStyle.compact && (
                                                    <button
                                                        onClick={() => handleBuyClick(product)}
                                                        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white ${cStyle.btn} rounded-lg font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm`}
                                                    >
                                                        Купити
                                                    </button>
                                                )}

                                                <div className="flex gap-1 ml-auto">
                                                    <button
                                                        onClick={(e) => handleCartAction(e, product)}
                                                        className={`${cStyle.cartBtn} flex items-center justify-center rounded-lg transition-all active:scale-90 border-2 ${isInCart ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
                                                        title={isInCart ? "Прибрати" : "Додати"}
                                                    >
                                                        <svg className={cStyle.compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isInCart ? "3" : "2.5"}>
                                                            {isInCart ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            )}
                                                        </svg>
                                                    </button>

                                                    <a
                                                        href="tel:380681374018"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`${cStyle.phoneBtn} flex items-center justify-center rounded-lg border-2 border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all active:scale-90`}
                                                    >
                                                        <svg className={cStyle.compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- МОДАЛЬНЕ ВІКНО ЗАМОВЛЕННЯ --- */}
            {
                showModal && selectedProduct && (
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
                                    <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatNumber(selectedProduct.price)} грн</span>
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
                                        <p className="text-blue-600 font-black text-sm">{formatPrice(selectedProduct.price)}</p>
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
                                            className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${isSelectedInCart
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
                )
            }
        </section >
    );
}