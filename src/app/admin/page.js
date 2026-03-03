"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase, fetchCategories, fetchProductsWithDetails, saveProduct, deleteProducts, updateProductsStatus, bulkUpsertProducts, upsertCategory, deleteCategory } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

// Наші нові компоненти
import AdminSidebar from './components/AdminSidebar';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CategoryManager from './components/CategoryManager';
import AdminStats from './components/AdminStats';

export default function AdminPage() {
    const router = useRouter();

    // --- СТАНИ ---
    const [activeTab, setActiveTab] = useState('products'); // products, categories, stats
    const [allProducts, setAllProducts] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Стан для логіну
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // --- 1. ПЕРЕВІРКА ПРАВ ТА ЗАВАНТАЖЕННЯ ---
    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuthorized(true);
                loadData();
            } else {
                setIsLoading(false);
            }
        }
        init();
    }, []);

    async function loadData() {
        try {
            setIsLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                fetchProductsWithDetails(null),
                fetchCategories()
            ]);
            setAllProducts(productsData);
            setDbCategories(categoriesData);
        } catch (err) {
            console.error('Помилка завантаження:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // --- 2. ЛОГІКА ДЛЯ ТОВАРІВ ---
    const handleSaveProduct = async (formData) => {
        try {
            await saveProduct(formData);
            setShowModal(false);
            setEditingProduct(null);
            loadData(); // Перезавантажуємо список
        } catch (err) {
            alert('Помилка при збереженні: ' + err.message);
        }
    };

    const handleDeleteProduct = async (product) => {
        if (confirm(`Видалити товар "${product.name}"?`)) {
            try {
                const urls = [];
                if (product.main_image) urls.push(product.main_image);
                if (Array.isArray(product.images)) urls.push(...product.images);

                await deleteProducts([product.id], urls);
                loadData();
            } catch (err) {
                alert('Помилка видалення: ' + err.message);
            }
        }
    };

    const handleBulkDelete = async (ids) => {
        if (confirm(`Видалити вибрані товари (${ids.length})?`)) {
            try {
                const productsToDelete = allProducts.filter(p => ids.includes(p.id));
                const allUrls = [];
                productsToDelete.forEach(p => {
                    if (p.main_image) allUrls.push(p.main_image);
                    if (Array.isArray(p.images)) allUrls.push(...p.images);
                });

                await deleteProducts(ids, allUrls);
                loadData();
            } catch (err) {
                alert('Помилка при видаленні: ' + err.message);
            }
        }
    };

    const handleCopyProduct = (product) => {
        const { id, created_at, ...rest } = product;
        setEditingProduct({ ...rest, name: `${rest.name} (Копія)` });
        setShowModal(true);
    };
    const handleBulkStatusChange = async (ids, newStatus) => {
        try {
            await updateProductsStatus(ids, newStatus);
            loadData();
        } catch (err) {
            alert('Помилка при зміні статусу: ' + err.message);
        }
    };

    const handleBulkImport = async (parsedData) => {
        try {
            await bulkUpsertProducts(parsedData);
            alert(`Успішно імпортовано ${parsedData.length} товарів!`);
            loadData();
        } catch (err) {
            alert('Помилка збереження імпорту: ' + err.message);
        }
    };

    // --- 3. ЛОГІКА ДЛЯ КАТЕГОРІЙ ---
    const handleAddCategory = async (cat) => {
        try {
            await upsertCategory(cat);
            loadData();
        } catch (err) {
            alert('Помилка категорії: ' + err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (confirm('Видалити цю категорію?')) {
            try {
                await deleteCategory(id);
                loadData();
            } catch (err) {
                alert('Неможливо видалити категорію (можливо, в ній є товари)');
            }
        }
    };

    // --- 4. ДОПОМІЖНІ ДАНІ ДЛЯ ФОРМИ ---
    const dynamicBrands = useMemo(() => {
        return Array.from(new Set(allProducts.map(p => p.car_brand))).filter(Boolean);
    }, [allProducts]);

    const dynamicModels = useMemo(() => {
        let models = [];
        allProducts.forEach(p => {
            if (Array.isArray(p.compatible_models)) models.push(...p.compatible_models);
        });
        return Array.from(new Set(models)).filter(Boolean);
    }, [allProducts]);

    // --- 5. ЛОГІН ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword(loginData);
        if (error) alert('Невірний логін або пароль');
        else window.location.reload();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    // --- ЕКРАН ЗАВАНТАЖЕННЯ ---
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Вхід в систему...</p>
            </div>
        </div>
    );

    // --- ФОРМА ВХОДУ ---
    if (!isAuthorized) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 text-center">Адмін-панель</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-900 placeholder:text-slate-500"
                        onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-900 placeholder:text-slate-500"
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-95">
                        Увійти
                    </button>
                </form>
            </div>
        </div>
    );

    // --- ГОЛОВНИЙ ЕКРАН АДМІНКИ ---
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
            />

            <main className={`flex-grow transition-all duration-300 ${showModal ? 'lg:pr-[600px] xl:pr-[700px]' : ''}`}>
                {activeTab === 'products' && (
                    <ProductList
                        products={allProducts}
                        onEdit={(p) => { setEditingProduct(p); setShowModal(true); }}
                        onDelete={handleDeleteProduct}
                        onCopy={handleCopyProduct}
                        onAdd={() => { setEditingProduct(null); setShowModal(true); }}
                        onBulkDelete={handleBulkDelete}
                        onBulkStatusChange={handleBulkStatusChange}
                        onBulkImport={handleBulkImport}
                    />
                )}

                {activeTab === 'categories' && (
                    <CategoryManager
                        categories={dbCategories}
                        onAdd={handleAddCategory}
                        onDelete={handleDeleteCategory}
                    />
                )}

                {activeTab === 'stats' && (
                    <AdminStats
                        products={allProducts}
                        categories={dbCategories}
                        onNav={setActiveTab}
                    />
                )}
            </main>

            {/* Модалка форми товару */}
            {showModal && (
                <ProductForm
                    product={editingProduct}
                    categories={dbCategories}
                    existingBrands={dynamicBrands}
                    existingModels={dynamicModels}
                    onSave={handleSaveProduct}
                    onCancel={() => { setShowModal(false); setEditingProduct(null); }}
                />
            )}
        </div>
    );
}