/**
 * Утиліти для роботи з CSV (Експорт/Імпорт)
 */

// Функція для екранування значень CSV
const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Якщо рядок містить кому, переноски або лапки, беремо його в лапки і подвоюємо існуючі лапки
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Експорт масиву товарів у CSV
export const exportToCSV = (products) => {
    if (!products || !products.length) {
        alert('Немає товарів для експорту');
        return;
    }

    // Заголовки (Назви колонок в Excel / Пром)
    const headers = [
        'ID',
        'Назва_Позиції',
        'Артикул',
        'Ціна',
        'Кількість',
        'OE_Номер',
        'Категорія',
        'Марка_Авто',
        'Моделі',
        'Стан',
        'Статус',
        'Головне_Фото',
        'Додаткові_Фото',
        'Опис'
    ];

    // Формуємо рядки
    const rows = products.map(p => [
        p.id,
        p.name,
        p.sku || '',
        p.price || 0,
        p.quantity || 0,
        p.oe_number || '',
        p.category?.name || '',
        p.car_brand || '',
        (p.compatible_models || []).join('; '),
        p.condition || '',
        p.status || '',
        p.main_image || '',
        (p.images || []).join(', '),
        p.description || ''
    ]);

    // Об'єднуємо все в один текст
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Створюємо файл і завантажуємо
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \ufeff для підтримки кирилиці в Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Парсинг CSV (Базова реалізація без залежностей)
export const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const parseLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++; // skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(cur);
                cur = '';
            } else {
                cur += char;
            }
        }
        result.push(cur);
        return result;
    };

    const headers = parseLine(lines[0]).map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        const obj = {};
        headers.forEach((h, index) => {
            obj[h] = values[index] !== undefined ? values[index].trim() : '';
        });
        // Мапинг заголовків на поля БД
        const product = {
            id: obj['ID'] || undefined, // Якщо порожньо, буде створено новий
            name: obj['Назва_Позиції'] || 'Новий товар (з імпорту)',
            sku: obj['Артикул'] || '',
            price: parseFloat(obj['Ціна']) || 0,
            quantity: parseInt(obj['Кількість']) || 0,
            oe_number: obj['OE_Номер'] || '',
            car_brand: obj['Марка_Авто'] || '',
            compatible_models: obj['Моделі'] ? obj['Моделі'].split(';').map(m => m.trim()).filter(Boolean) : [],
            condition: obj['Стан'] || 'Б/У',
            status: obj['Статус'] || 'draft',
            main_image: obj['Головне_Фото'] || '',
            images: obj['Додаткові_Фото'] ? obj['Додаткові_Фото'].split(',').map(m => m.trim()).filter(Boolean) : [],
            description: obj['Опис'] || ''
        };
        // ID: обробка (щоб Supabase згенерував новий ID якщо його немає)
        if (!product.id || product.id === '') {
            delete product.id;
        }

        data.push(product);
    }

    return data;
};

// Читання файлу
export const readCSVFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = parseCSV(e.target.result);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};
