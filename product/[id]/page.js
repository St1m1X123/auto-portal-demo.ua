import { dummyProducts } from '../../../utils/inventoryData';
import ProductClient from './ProductClient';

// --- ГЕНЕРАЦИЯ МЕТА-ТЕГОВ (SEO) ---
// Эта функция запускается на сервере перед тем, как отдать страницу
export async function generateMetadata({ params }) {
  // 1. Ищем товар по ID из ссылки
  const product = dummyProducts.find((p) => p.id.toString() === params.id);

  // Если товара нет (например, удалили), возвращаем стандартный заголовок
  if (!product) {
    return {
      title: 'Товар не знайдено | Опель Шрот Горохів',
    };
  }

  // 2. Формируем красивый заголовок и описание
  const title = `${product.name} (${product.oe}) | Купити в м. Горохів`;
  const description = `Оригінальна Б/В запчастина: ${product.name}. Ціна: ${product.price}. Оригінальний номер: ${product.oe}. Стан: ${product.condition}. Відправка по Україні. ☎️ 068 137 40 18`;

  // 3. Возвращаем правильные теги для Гугла и Мессенджеров
  return {
    title: title,
    description: description,
    
    // Настройки для Facebook, Viber, Telegram
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: product.image, // <-- Вот та самая фотка товара!
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      locale: 'uk_UA',
      type: 'website',
    },
  };
}

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---
export default function Page() {
  // Просто показываем твою красивую клиентскую часть
  return <ProductClient />;
}