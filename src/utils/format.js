/**
 * Форматує число: додає пробіли між розрядами
 * Приклад: 1500 -> "1 500"
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '0';
    const n = typeof num === 'string' ? parseFloat(num.replace(/[^\d.]/g, '')) : num;
    if (isNaN(n)) return String(num);
    return new Intl.NumberFormat('uk-UA', {
        maximumFractionDigits: 0,
    }).format(n);
};

/**
 * Форматує ціну для відображення: додає пробіли між розрядами та суфікс "грн"
 * Приклад: 1500 -> "1 500 грн"
 */
export const formatPrice = (price) => {
    if (!price && price !== 0) return 'Ціна договірна';
    return `${formatNumber(price)} грн`;
};
