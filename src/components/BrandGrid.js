import React from 'react';

export default function BrandGrid({ brands = [], onSelectBrand }) {
  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            КАТАЛОГ МАРОК
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {brands.map(brand => (
            <div
              key={brand}
              onClick={() => onSelectBrand(brand)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center shadow-sm hover:border-blue-600 hover:shadow-md transition-all active:scale-95"
            >
              {/* Якщо марка OPEL - виводимо логотип, інакше дефолтну іконку */}
              {brand.toUpperCase() === 'OPEL' ? (
                <img
                  src="/opel-logo.png"
                  alt="Opel"
                  className="w-12 h-12 object-contain mb-3 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl mb-3 shadow-inner">
                  {brand[0]}
                </div>
              )}
              <h3 className="font-black text-lg text-slate-800 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                {brand}
              </h3>
            </div>
          ))}

          {/* Картка "В розробці", якщо брендів мало */}
          {brands.length < 4 && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center opacity-60 cursor-not-allowed">
              <span className="text-3xl mb-3 text-gray-300">?</span>
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Інші марки</h3>
              <span className="text-[10px] text-gray-400 font-medium mt-1">Скоро</span>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}