"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import {
    brands as inventoryBrands,
    models as inventoryModels,
    categories as inventoryCategories
} from '@/utils/inventoryData';

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI состояния
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModel, setFilterModel] = useState('Всі');
    const [filterCategory, setFilterCategory] = useState('Всі');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [visibleCount, setVisibleCount] = useState(40);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImpExpOpen, setIsImpExpOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [quickUploading, setQuickUploading] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [availableSubcats, setAvailableSubcats] = useState([]);
    const fileInputRef = useRef(null);

    const [newProduct, setNewProduct] = useState({
        brand: inventoryBrands[0] || 'OPEL',
        name: '',
        price: '',
        oe: '',
        models: inventoryModels[0] || '',
        category: '',
        subcat: '',
        images: [],
        condition: 'Вживане',
        description: '',
        status: 'active'
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- ФІКС СКРОЛУ ФОНУ ---
    useEffect(() => {
        // Добавили проверку viewingProduct
        if (isModalOpen || viewingProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen, viewingProduct]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) fetchAdminProducts();
            setLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchAdminProducts();
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const fetchSubcatsFromDB = async () => {
            if (!newProduct.category) {
                setAvailableSubcats([]);
                return;
            }
            const { data, error } = await supabase
                .from('products')
                .select('subcat')
                .eq('category', newProduct.category);

            if (!error && data) {
                const uniqueSubcats = [...new Set(data.map(item => item.subcat).filter(Boolean))];
                setAvailableSubcats(uniqueSubcats.sort());
            }
        };
        fetchSubcatsFromDB();
    }, [newProduct.category]);

    // Скидаємо ліміт до 40 при будь-якій зміні фільтрів або пошуку
    useEffect(() => {
        setVisibleCount(40);
    }, [searchQuery, filterModel, filterCategory, activeTab]);

    // --- СТАТИСТИКА СКЛАДУ (ДАШБОРД) ---
    const stats = useMemo(() => {
        const activeProducts = products.filter(p => p.status !== 'draft');
        const draftCount = products.filter(p => p.status === 'draft').length;

        // 1. Считаем деньги (только активные товары)
        const totalMoney = activeProducts.reduce((sum, p) => {
            // Удаляем пробелы и "грн", превращаем в число
            const price = parseInt((p.price || '0').replace(/\D/g, '')) || 0;
            return sum + price;
        }, 0);

        // Форматируем сумму (например: 1 250 000)
        const formattedMoney = totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

        // 2. Ищем Топ-Модель
        const modelCounts = {};
        activeProducts.forEach(p => {
            const m = p.models || 'Інше';
            modelCounts[m] = (modelCounts[m] || 0) + 1;
        });

        let topModel = '---';
        let maxCount = 0;

        Object.entries(modelCounts).forEach(([model, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topModel = model;
            }
        });

        return {
            money: formattedMoney,
            count: activeProducts.length,
            drafts: draftCount,
            topModel,
            topModelCount: maxCount
        };
    }, [products]);

    async function fetchAdminProducts() {
        const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
        if (!error) setProducts(data || []);
    }

    async function handleQuickDraftUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setQuickUploading(true);
        const uploadedUrls = [];
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                const fileName = `draft-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, compressedFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                uploadedUrls.push(publicUrl);
            }
            const draftProduct = {
                status: 'draft',
                images: uploadedUrls,
                name: 'Чернетка (Без назви)',
                price: '',
                category: 'Інше',
                brand: 'OPEL',
                condition: 'Вживане'
            };
            const { data, error } = await supabase.from('products').insert([draftProduct]).select();
            if (error) throw error;
            const newId = data[0].id;
            alert(`✅ ГОТОВО!\n\nНапиши на деталі номер: #${newId}`);
            setProducts([data[0], ...products]);
            setActiveTab('draft');
        } catch (error) {
            alert('Помилка швидкого фото: ' + error.message);
        } finally {
            setQuickUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function openCreateModal() {
        setEditingId(null);
        resetForm();
        setIsModalOpen(true);
    }

    function openEditModal(product) {
        setEditingId(product.id);
        setNewProduct({
            brand: product.brand || 'OPEL',
            name: product.name || '',
            price: product.price ? product.price.replace(' грн', '') : '',
            oe: product.oe || '',
            models: product.models || '',
            category: product.category || '',
            subcat: product.subcat || '',
            images: product.images || (product.image ? [product.image] : []),
            condition: product.condition || 'Вживане',
            description: product.description || '',
            status: 'active'
        });
        setIsModalOpen(true);
    }

    function handleCopyProduct(e, product) {
        e.stopPropagation();
        setEditingId(null);
        setNewProduct({
            brand: product.brand || 'OPEL',
            name: '',
            price: '',
            oe: '',
            models: product.models || '',
            category: product.category || '',
            subcat: product.subcat || '',
            images: [],
            condition: product.condition || 'Вживане',
            description: '',
            status: 'active'
        });
        setIsModalOpen(true);
    }

    function handleShareProduct(product) {
        // Формируем ссылку (берем текущий домен сайта)
        const productUrl = `${window.location.origin}/product/${product.id}`;

        const textToShare = `🔧 ${product.name}\n🚘 ${product.brand} ${product.models}\n💰 Ціна: ${product.price}\n👉 Фото та замовлення: ${productUrl}`;

        navigator.clipboard.writeText(textToShare).then(() => {
            alert("✅ Посилання скопійовано!");
        }).catch(err => {
            console.error('Помилка копіювання: ', err);
        });
    }

    // --- СОРТУВАННЯ ---
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    async function handleSaveProduct(e, stayOpen = false) {
        e.preventDefault();
        const finalPrice = newProduct.price ? `${newProduct.price} грн` : '';
        const productToSave = {
            ...newProduct,
            price: finalPrice,
            images: newProduct.images.length > 0 ? newProduct.images : null,
            category: newProduct.category || "Інше",
            status: 'active'
        };
        delete productToSave.image;
        let error; let data;
        if (editingId) {
            const response = await supabase.from('products').update(productToSave).eq('id', editingId).select();
            error = response.error; data = response.data;
        } else {
            const response = await supabase.from('products').insert([productToSave]).select();
            error = response.error; data = response.data;
        }
        if (error) {
            alert("Помилка: " + error.message);
        } else {
            if (editingId) {
                setProducts(products.map(p => p.id === editingId ? data[0] : p));
            } else {
                setProducts([data[0], ...products]);
            }
            if (stayOpen) {
                alert(`✅ Товар #${data[0].id} збережено!`);
                setEditingId(null);
                setNewProduct(prev => ({ ...prev, name: '', price: '', oe: '', images: [], description: '' }));
            } else {
                setIsModalOpen(false);
                resetForm();
                setActiveTab('active');
            }
        }
    }

    async function deleteImageFromStorage(imageUrl) {
        if (!imageUrl) return;
        try {
            const fileName = imageUrl.split('/').pop();
            await supabase.storage.from('products').remove([fileName]);
        } catch (err) { console.error(err); }
    }

    async function handleImageUploadInModal(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, compressedFile);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                setNewProduct(prev => ({ ...prev, images: [...prev.images, publicUrl] }));
            } catch (error) { alert(error.message); }
        }
        setUploading(false);
    }

    async function handleRemoveImage(indexToRemove) {
        const imageToDelete = newProduct.images[indexToRemove];
        if (!confirm("Видалити це фото?")) return;
        await deleteImageFromStorage(imageToDelete);
        setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }));
    }

    async function handleCloseModal() {
        if (!editingId && newProduct.images.length > 0) {
            await Promise.all(newProduct.images.map(img => deleteImageFromStorage(img)));
        }
        setIsModalOpen(false);
        resetForm();
    }

    function resetForm() {
        setNewProduct({
            brand: inventoryBrands[0] || 'OPEL',
            name: '', price: '', oe: '',
            models: inventoryModels[0] || '',
            category: '', subcat: '', images: [], condition: 'Вживане', description: '', status: 'active'
        });
        setEditingId(null);
    }

    async function handleDelete(e, id, name, productImages) {
        e.stopPropagation();
        if (!confirm(`Видалити "${name}"?`)) return;
        if (productImages && Array.isArray(productImages)) {
            await Promise.all(productImages.map(img => deleteImageFromStorage(img)));
        } else if (productImages && typeof productImages === 'string') {
            await deleteImageFromStorage(productImages);
        }
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) setProducts(products.filter(p => p.id !== id));
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert("Помилка: " + error.message);
    }

    // --- ФУНКЦІЇ ІМПОРТУ ТА ЕКСПОРТУ (ВИПРАВЛЕНІ) ---

    // 1. ЕКСПОРТ (Завантажити CSV)
    const handleExport = () => {
        const headers = ["id", "name", "brand", "models", "price", "oe", "category", "status", "description"];

        const csvRows = products.map(p => {
            // Функція для безпечної обробки тексту (екранування лапок)
            const safe = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;

            return [
                p.id,
                safe(p.name),
                p.brand,
                safe(p.models),
                safe(p.price), // ТЕПЕР ЦІНА ТЕЖ В ЛАПКАХ (безпечно)
                p.oe || '',
                p.category,
                p.status,
                safe((p.description || '').replace(/\n/g, ' '))
            ].join(",");
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 2. ІМПОРТ (Читання файлу) - ВИПРАВЛЕНИЙ
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text.split("\n").map(r => r.trim()).filter(r => r);

            const productsToUpsert = [];

            // Функція очистки від лапок "текст" -> текст
            const clean = (val) => val ? val.trim().replace(/^"|"$/g, '').replace(/""/g, '"') : '';

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                // Розділяємо по комі, ігноруючи коми всередині лапок
                const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

                if (values.length < 2) continue;

                // ВАЖЛИВО: Спочатку чистимо ID від лапок, потім робимо числом
                const rawId = clean(values[0]);
                const id = rawId ? parseInt(rawId) : null;

                const p = {
                    id: id,
                    name: clean(values[1]),
                    brand: clean(values[2]) || 'OPEL',
                    models: clean(values[3]),
                    price: clean(values[4]),
                    oe: clean(values[5]),
                    category: clean(values[6]) || 'Інше',
                    status: clean(values[7]) || 'draft',
                    description: clean(values[8])
                };

                // Якщо ID порожній або 0 — видаляємо поле, щоб створився новий
                if (!p.id) delete p.id;

                productsToUpsert.push(p);
            }

            if (confirm(`Знайдено ${productsToUpsert.length} товарів. Оновити базу?`)) {
                setLoading(true);
                const { error } = await supabase.from('products').upsert(productsToUpsert);

                if (error) {
                    alert("Помилка імпорту: " + error.message);
                } else {
                    alert("✅ Успішно! Товари оновлено, дублікатів не буде.");
                    setIsImpExpOpen(false);
                    fetchAdminProducts();
                }
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const inputStyle = "w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-sm";

    // УМНАЯ ФИЛЬТРАЦИЯ + СОРТИРОВКА
    const filteredAndSortedProducts = products
        .filter(p => {
            if (!p) return false;
            // 1. Статус
            if ((p.status || 'active') !== activeTab) return false;
            // 2. Модель
            if (filterModel !== 'Всі' && p.models !== filterModel) return false;
            // 3. Категорія
            if (filterCategory !== 'Всі' && p.category !== filterCategory) return false;
            // 4. Пошук
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (p.name || '').toLowerCase().includes(query) ||
                    (p.oe || '').toLowerCase().includes(query) ||
                    p.id.toString().includes(query);
            }
            return true;
        })
        .sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Якщо сортуємо за ціною - перетворюємо "1200 грн" в число 1200
            if (sortConfig.key === 'price') {
                aValue = parseFloat((a.price || '0').replace(/\D/g, '')) || 0;
                bValue = parseFloat((b.price || '0').replace(/\D/g, '')) || 0;
            }
            // Якщо текст - порівнюємо без урахування регістру
            else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) return <div className="p-10 text-center uppercase font-bold text-slate-400 text-xs tracking-widest">Завантаження...</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200">
                    <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter text-slate-900">Admin <span className="text-blue-600">Login</span></h1>
                    <div className="space-y-5">
                        <input type="email" placeholder="Email" className={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Пароль" className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-lg mt-4 transition-all">Увійти</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* ГАРНИЙ СКРОЛБАР */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                }
            `}</style>

            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                {/* Логотип (Зліва) */}
                <h1 className="font-black text-xl uppercase tracking-tighter text-slate-900">Admin <span className="text-blue-600">Portal</span></h1>

                {/* Група кнопок (Справа разом) */}
                <div className="flex items-center gap-3">

                    {/* Кнопка БАЗИ */}
                    <button
                        onClick={() => setIsImpExpOpen(true)}
                        className="flex items-center gap-2 text-blue-400 border border-blue-400/30 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-4 py-2 rounded-lg transition-all active:scale-95"
                        title="Імпорт та Експорт"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        <span className="hidden md:inline font-bold text-sm">База</span>
                    </button>

                    {/* Кнопка Вийти */}
                    <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl border border-red-100 transition-all">
                        Вийти
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                {/* --- ДАШБОРД (PREMIUM STYLE) --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

                    {/* Картка 1: ГРОШІ (Темна, Градієнтна) */}
                    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] shadow-xl text-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-slate-700">
                        {/* Фонова декоративна ікона */}
                        <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-white/10 transition-colors">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Капітал</span>
                            </div>
                            <div>
                                <span className="text-2xl md:text-3xl font-black tracking-tight block truncate" title={stats.money}>
                                    {stats.money} <span className="text-sm opacity-50 font-medium">₴</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Картка 2: АКТИВНІ (Біла з синім акцентом) */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:w-2 transition-all"></div>

                        <div className="pl-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">В продажу</span>
                            <span className="text-3xl md:text-4xl font-black text-slate-800 block mb-1">{stats.count}</span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md inline-block">
                                Активні товари
                            </span>
                        </div>
                    </div>

                    {/* Картка 3: ЧЕРНЕТКИ (Біла з жовтим акцентом) */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 group-hover:w-2 transition-all"></div>

                        <div className="pl-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Чернетки</span>
                            <span className="text-3xl md:text-4xl font-black text-slate-800 block mb-1">{stats.drafts}</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block">
                                Потребують опису
                            </span>
                        </div>
                    </div>

                    {/* Картка 4: ЛІДЕР (Біла з фіолетовим акцентом) */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 group-hover:w-2 transition-all"></div>

                        <div className="pl-2 flex flex-col h-full justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Топ авто</span>
                            <span className="text-lg md:text-xl font-black text-slate-800 leading-tight block truncate mb-1" title={stats.topModel}>
                                {stats.topModel}
                            </span>
                            <div>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block">
                                    {stats.topModelCount} запчастин
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div onClick={() => fileInputRef.current.click()} className={`bg-slate-900 p-8 rounded-[2rem] shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-white flex flex-col items-center justify-center text-center gap-4 border-2 border-slate-900 ${quickUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleQuickDraftUpload} />
                        {quickUploading ? <div className="animate-spin text-4xl">⏳</div> : <div className="text-5xl">📸</div>}
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Швидке фото</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Для роботи в гаражі</p>
                        </div>
                    </div>

                    <div onClick={openCreateModal} className="bg-white p-8 rounded-[2rem] shadow-sm cursor-pointer hover:border-blue-300 border-2 border-slate-100 hover:shadow-xl transition-all flex flex-col items-center justify-center text-center gap-4 group">
                        <div className="text-5xl group-hover:scale-110 transition-transform">📝</div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Заповнити вручну</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Повний опис товару</p>
                        </div>
                    </div>
                </div>

                {/* --- ПАНЕЛЬ ІНСТРУМЕНТІВ (ВКЛАДКИ + ФІЛЬТРИ + ПОШУК) --- */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">

                    {/* Вкладки (Зліва) */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar shrink-0">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                        >
                            Активні
                        </button>
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'draft' ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                        >
                            Чернетки
                            <span className="bg-white/30 px-2 py-0.5 rounded text-[9px]">
                                {products.filter(p => p && p.status === 'draft').length}
                            </span>
                        </button>
                    </div>

                    {/* Блок Фільтрів та Пошуку (Справа) */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto lg:justify-end">

                        {/* Фільтр по Моделі */}
                        <select
                            value={filterModel}
                            onChange={(e) => setFilterModel(e.target.value)}
                            className="w-full md:w-40 px-3 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-[10px] uppercase tracking-wider focus:outline-none focus:border-blue-600 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.4rem_center] bg-[length:1.1rem_1.1rem] bg-no-repeat pr-7"
                        >
                            <option value="Всі">Всі Моделі</option>
                            {inventoryModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        {/* Фільтр по Категорії */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full md:w-48 px-3 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-[10px] uppercase tracking-wider focus:outline-none focus:border-blue-600 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.4rem_center] bg-[length:1.1rem_1.1rem] bg-no-repeat pr-7"
                        >
                            <option value="Всі">Всі Категорії</option>
                            {inventoryCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {/* Пошук (Широкий w-64, але висота py-3 як у інших) */}
                        <div className="relative w-full md:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Пошук..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-[12px] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">

                    {/* Підказка для мобільних (зникає на комп'ютері) */}
                    <div className="md:hidden text-center bg-blue-50 py-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100">
                        ← Гортайте таблицю вбік →
                    </div>

                    {/* Контейнер зі скролом */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                <tr>
                                    <th onClick={() => requestSort('id')} className="px-4 py-4 md:px-6 md:py-5 cursor-pointer hover:text-blue-600 transition-colors min-w-[70px]">
                                        ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-4 py-4 md:px-6 md:py-5 w-16 min-w-[70px]">Фото</th>
                                    <th onClick={() => requestSort('name')} className="px-4 py-4 md:px-6 md:py-5 cursor-pointer hover:text-blue-600 transition-colors min-w-[200px]">
                                        Назва / OE {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-4 py-4 md:px-6 md:py-5 min-w-[140px]">Авто</th>
                                    <th onClick={() => requestSort('price')} className="px-4 py-4 md:px-6 md:py-5 cursor-pointer hover:text-blue-600 transition-colors text-right min-w-[100px]">
                                        Ціна {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-4 py-4 md:px-6 md:py-5 text-right min-w-[100px]">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAndSortedProducts.slice(0, visibleCount).map((p) => (
                                    <tr key={p.id} onClick={() => { setViewingProduct(p); setCurrentImageIndex(0); }} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                        {/* ID */}
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <span className="font-mono font-bold text-slate-400 text-[10px] md:text-xs group-hover:text-blue-600">#{p.id}</span>
                                        </td>

                                        {/* ФОТО */}
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center relative shrink-0">
                                                {p.images && p.images[0] ? (
                                                    <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <span className="text-[8px] text-slate-400">NO IMG</span>
                                                )}
                                                {p.status === 'draft' && <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px]" />}
                                            </div>
                                        </td>

                                        {/* НАЗВА + OE */}
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <p className={`text-xs md:text-sm font-bold ${p.status === 'draft' ? 'text-amber-600 italic' : 'text-slate-800'} line-clamp-2`}>
                                                {p.name || 'Без назви'}
                                            </p>
                                            {p.oe && (
                                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 font-mono truncate max-w-[180px]">
                                                    OE: <span className="text-slate-500">{p.oe}</span>
                                                </p>
                                            )}
                                        </td>

                                        {/* АВТО */}
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">{p.brand || 'OPEL'}</span>
                                                <span className="text-[10px] md:text-xs font-bold text-slate-700 whitespace-nowrap">{p.models}</span>
                                            </div>
                                        </td>

                                        {/* ЦІНА */}
                                        <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                                            <p className="text-xs md:text-sm font-black text-blue-600 whitespace-nowrap">
                                                {p.price || '---'}
                                            </p>
                                        </td>

                                        {/* ДІЇ */}
                                        <td className="px-4 py-3 md:px-6 md:py-4">
                                            <div className="flex justify-end items-center gap-1 md:gap-2">
                                                {/* Кнопка РЕДАГУВАТИ (Олівець) */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(p); }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Редагувати"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>

                                                {/* Кнопка КОПІЮВАТИ */}
                                                <button
                                                    onClick={(e) => handleCopyProduct(e, p)}
                                                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Копіювати"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                                </button>

                                                {/* Кнопка ВИДАЛИТИ */}
                                                <button
                                                    onClick={(e) => handleDelete(e, p.id, p.name, p.images)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Видалити"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* КНОПКА "ПОКАЗАТИ ЩЕ" */}
                    {filteredAndSortedProducts.length > visibleCount && (
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 40)}
                                className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                            >
                                Показати ще (+40)
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px]">
                                    {visibleCount} з {filteredAndSortedProducts.length}
                                </span>
                            </button>
                        </div>
                    )}

                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <form onSubmit={(e) => handleSaveProduct(e)} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{editingId ? `Редагування #${editingId}` : 'Новий товар'}</h2>
                        </div>

                        {/* КОНТЕНТ З КАСТОМНИМ СКРОЛОМ */}
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Марка</label>
                                    <select className={inputStyle} value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}>
                                        {inventoryBrands.map(b => <option key={b} value={b}>{b}</option>)}
                                        <option value="Всі">Всі (Універсальне)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Назва запчастини</label>
                                    <input type="text" placeholder="Напр: Генератор 1.7" className={inputStyle} value={newProduct.name} onFocus={(e) => e.target.select()} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Категорія</label>
                                    <select className={inputStyle} value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} required>
                                        <option value="">-- Оберіть категорію --</option>
                                        {inventoryCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Підкатегорія</label>
                                    <input type="text" list="subcats-dynamic" placeholder="Оберіть або напишіть..." className={inputStyle} value={newProduct.subcat} onFocus={(e) => e.target.select()} onChange={(e) => setNewProduct({ ...newProduct, subcat: e.target.value })} />
                                    <datalist id="subcats-dynamic">{availableSubcats.map(sub => <option key={sub} value={sub} />)}</datalist>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {/* ЦІНА (З авто-пробілом) */}
                                <div className="relative">
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Ціна</label>
                                    <input
                                        type="text"                   // Міняємо number на text, щоб дозволити пробіли
                                        inputMode="numeric"           // Відкриває цифрову клавіатуру на телефоні
                                        placeholder="0"
                                        className={`${inputStyle} pr-12 text-blue-700`}
                                        value={newProduct.price}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            // 1. Видаляємо все, що НЕ цифри (якщо раптом вставили текст)
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            // 2. Форматуємо: додаємо пробіл після кожної тисячі
                                            const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                            setNewProduct({ ...newProduct, price: formatted });
                                        }}
                                        required
                                    />
                                    <span className="absolute right-4 top-9 text-[10px] font-black text-slate-400">ГРН</span>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">OE Номер</label>
                                    <input type="text" placeholder="GM..." className={inputStyle} value={newProduct.oe} onFocus={(e) => e.target.select()} onChange={(e) => setNewProduct({ ...newProduct, oe: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Модель</label>
                                    <select className={inputStyle} value={newProduct.models} onChange={(e) => setNewProduct({ ...newProduct, models: e.target.value })} required>
                                        {inventoryModels.map(m => <option key={m} value={m}>{m}</option>)}
                                        <option value="*">Всі моделі (*)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Стан</label>
                                    <select className={inputStyle} value={newProduct.condition} onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}>
                                        <option value="Вживане">Вживане</option>
                                        <option value="Нове">Нове</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-1 block">Опис товару</label>
                                <textarea rows="2" placeholder="Стан, дефекти, рік..." className={inputStyle + " resize-none"} value={newProduct.description} onFocus={(e) => e.target.select()} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-700 uppercase ml-1 mb-2 block">Фотографії</label>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
                                        <input type="file" accept="image/*" multiple onChange={handleImageUploadInModal} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer" />
                                        {uploading && <span className="text-xs font-bold text-blue-600 animate-pulse whitespace-nowrap">Стискаю та вантажу...</span>}
                                    </div>
                                    {newProduct.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {newProduct.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <div onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">ВИДАЛИТИ</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4 rounded-b-[2.5rem] shrink-0">
                            <button type="button" onClick={handleCloseModal} className="flex-1 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-200 transition-all order-3 md:order-1 bg-white border border-slate-200">Скасувати</button>
                            {!editingId && <button type="button" onClick={(e) => handleSaveProduct(e, true)} disabled={uploading} className="flex-1 bg-white text-blue-600 border border-blue-200 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-all order-2">Зберегти та ще один</button>}
                            <button type="submit" disabled={uploading} className="flex-[1.5] bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all order-1">{uploading ? 'Чекайте...' : (editingId ? 'Оновити' : 'Опублікувати')}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- МОДАЛКА ПЕРЕГЛЯДУ (КАРТКА ТОВАРУ) --- */}
            {viewingProduct && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setViewingProduct(null)} />

                    {/* 👇 ВИПРАВЛЕННЯ ТУТ: h-[85vh] для мобілки, flex-col */}
                    <div className="relative bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto md:max-h-[90vh]">

                        {/* ЛІВА ЧАСТИНА - ГАЛЕРЕЯ */}
                        {/* 👇 ВИПРАВЛЕННЯ ТУТ: h-[40%] для мобілки, shrink-0 щоб не сплющувало */}
                        <div className="w-full md:w-1/2 bg-slate-900 relative group h-[40%] md:h-auto md:min-h-[350px] shrink-0 flex items-center justify-center overflow-hidden">

                            {viewingProduct.images && viewingProduct.images.length > 0 ? (
                                <>
                                    <img
                                        src={viewingProduct.images[currentImageIndex]}
                                        className="w-full h-full object-contain absolute inset-0 transition-all duration-300"
                                        alt=""
                                    />

                                    {viewingProduct.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(prev => prev === 0 ? viewingProduct.images.length - 1 : prev - 1);
                                                }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all active:scale-95 z-20"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(prev => prev === viewingProduct.images.length - 1 ? 0 : prev + 1);
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all active:scale-95 z-20"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </button>

                                            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-20">
                                                {viewingProduct.images.map((_, idx) => (
                                                    <div key={idx} className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-slate-500 font-black uppercase text-xl flex flex-col items-center gap-2">
                                    <span className="text-4xl">📷</span>
                                    Немає фото
                                </div>
                            )}

                            <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md md:hidden z-30">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* ПРАВА ЧАСТИНА - ІНФО */}
                        {/* 👇 ВИПРАВЛЕННЯ ТУТ: h-[60%] для мобілки, flex flex-col */}
                        <div className="w-full md:w-1/2 flex flex-col bg-white h-[60%] md:h-auto overflow-hidden">

                            {/* Скрол тільки всередині цього блоку */}
                            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">

                                <div className="hidden md:flex justify-between items-start mb-6">
                                    <div>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block">ID: #{viewingProduct.id}</span>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{viewingProduct.name}</h2>
                                    </div>
                                    <button onClick={() => setViewingProduct(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Мобільний заголовок (з'являється тільки на телефоні всередині скролу) */}
                                <div className="md:hidden mb-4">
                                    <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{viewingProduct.name}</h2>
                                    <span className="text-[10px] font-bold text-slate-400">ID: #{viewingProduct.id}</span>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ціна</p>
                                        <p className="text-3xl font-black text-blue-600">{viewingProduct.price || '---'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">OE Номер</p>
                                            <p className="font-mono font-bold text-slate-700 break-all text-sm">{viewingProduct.oe || '---'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Стан</p>
                                            <p className="font-bold text-slate-700 text-sm">{viewingProduct.condition}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Автомобіль</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                                                {viewingProduct.brand ? viewingProduct.brand[0] : 'A'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{viewingProduct.brand}</p>
                                                <p className="text-xs font-bold text-slate-500">{viewingProduct.models}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {viewingProduct.description && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Опис</p>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                                                {viewingProduct.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Панель дій (Футер) з SVG іконками */}
                            <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex gap-2 md:gap-3 shrink-0">
                                {/* Кнопка ПОДІЛИТИСЬ */}
                                <button
                                    onClick={() => handleShareProduct(viewingProduct)}
                                    className="flex-1 bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 py-3 md:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center active:scale-95 group"
                                >
                                    <svg className="w-5 h-5 md:w-6 md:h-6 mb-1 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="hidden md:inline">Поділитись</span>
                                    <span className="md:hidden">Лінк</span>
                                </button>

                                {/* Кнопка КОПІЯ */}
                                <button
                                    onClick={() => {
                                        const p = viewingProduct;
                                        setViewingProduct(null);
                                        handleCopyProduct({ stopPropagation: () => { } }, p);
                                    }}
                                    className="flex-1 bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 py-3 md:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center active:scale-95 group"
                                >
                                    <svg className="w-5 h-5 md:w-6 md:h-6 mb-1 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                    </svg>
                                    <span className="hidden md:inline">Копія</span>
                                    <span className="md:hidden">Копі</span>
                                </button>

                                {/* Кнопка РЕДАГУВАТИ */}
                                <button
                                    onClick={() => {
                                        const p = viewingProduct;
                                        setViewingProduct(null);
                                        openEditModal(p);
                                    }}
                                    className="flex-[1.5] bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 py-3 md:py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex flex-col items-center justify-center active:scale-95"
                                >
                                    <svg className="w-5 h-5 md:w-6 md:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span className="hidden md:inline">Редагувати</span>
                                    <span className="md:hidden">Ред.</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- МОДАЛКА ІМПОРТУ / ЕКСПОРТУ --- */}
            {isImpExpOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsImpExpOpen(false)} />

                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Управління базою</h2>
                            <p className="text-slate-500 text-sm">Вивантажте товари в Excel для редагування або завантажте оновлений файл.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ЕКСПОРТ (СКАЧАТИ) */}
                            <button
                                onClick={handleExport}
                                className="group relative overflow-hidden bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 hover:border-emerald-200 rounded-3xl p-6 transition-all text-left flex flex-col items-center gap-4 active:scale-95"
                            >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-emerald-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black text-slate-800 text-lg">Завантажити Excel</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Експорт поточної бази</p>
                                </div>
                            </button>

                            {/* ІМПОРТ (ЗАВАНТАЖИТИ) */}
                            <label className="group relative overflow-hidden bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 hover:border-blue-200 rounded-3xl p-6 transition-all text-left flex flex-col items-center gap-4 active:scale-95 cursor-pointer">
                                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-black text-slate-800 text-lg">Оновити з файлу</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Імпорт (CSV)</p>
                                </div>
                            </label>
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={() => setIsImpExpOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">
                                Закрити вікно
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}