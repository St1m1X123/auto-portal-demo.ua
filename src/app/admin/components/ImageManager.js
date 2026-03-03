"use client";

import React, { useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/utils/supabase';

/**
 * Керування фотографіями для товару
 * Оптимізовано для завантаження з телефону
 */
export default function ImageManager({ images = [], mainImage, onChange }) {

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Стрілочні опції стиснення
        const options = {
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            initialQuality: 0.8
        };

        const uploadPromises = files.map(async (file) => {
            try {
                const compressedFile = await imageCompression(file, options);
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                return publicUrl;
            } catch (err) {
                console.error('Помилка завантаження:', err);
                return null;
            }
        });

        const newUrls = (await Promise.all(uploadPromises)).filter(Boolean);
        const updatedImages = [...images, ...newUrls];

        // Якщо головного фото немає - беремо перше завантажене
        const updatedMain = mainImage || newUrls[0];

        onChange(updatedImages, updatedMain);
    };

    const removeImage = (index) => {
        const target = images[index];
        const updatedImages = images.filter((_, i) => i !== index);

        // Якщо видалили головне фото - ставимо нове
        let updatedMain = mainImage;
        if (target === mainImage) {
            updatedMain = updatedImages[0] || null;
        }

        onChange(updatedImages, updatedMain);
    };

    const setAsMain = (url) => {
        onChange(images, url);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Фотографії</label>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{images.length} завантажено</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Кнопка "Додати" */}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Додати</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>

                {images.map((url, idx) => (
                    <div key={idx} className={`relative aspect-square rounded-3xl overflow-hidden border-2 transition-all ${url === mainImage ? 'border-blue-500 shadow-md ring-4 ring-blue-50' : 'border-slate-100'}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />

                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => setAsMain(url)}
                                className="bg-white p-2 rounded-xl text-xs font-bold"
                                title="Зробити головним"
                            >
                                ⭐
                            </button>
                            <button
                                onClick={() => removeImage(idx)}
                                className="bg-white p-2 rounded-xl text-xs font-bold text-red-500"
                                title="Видалити"
                            >
                                🗑️
                            </button>
                        </div>

                        {url === mainImage && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Головне</div>
                        )}
                    </div>
                ))}
            </div>

            {images.length > 0 && <p className="text-[10px] text-slate-500 text-center italic font-medium">Порада: Натисніть ⭐ щоб вибрати головне фото для каталогу</p>}
        </div>
    );
}
