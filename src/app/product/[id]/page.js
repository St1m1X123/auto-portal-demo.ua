import { dummyProducts } from '../../../utils/inventoryData';
import ProductClient from './ProductClient';

// --- ГЕНЕРАЦІЯ МЕТА-ТЕГІВ (SEO) ---
export async function generateMetadata({ params }) {
  // 1. Шукаємо товар по ID
  const product = dummyProducts.find((p) => p.id.toString() === params.id);

  // ВАЖЛИВО: Вказуємо реальну адресу твого сайту на Vercel
  // Без цього Facebook часто ігнорує картинки
  const baseUrl = 'https://auto-portal-demo-ua.vercel.app';

  // Якщо товару немає (або стара версія файлу на сервері), віддаємо заглушку
  if (!product) {
    return {
      metadataBase: new URL(baseUrl),
      title: 'Товар не знайдено | Опель Шрот Горохів',
      description: 'Професійна розборка та продаж запчастин',
      openGraph: {
        images: '/logo.png', // Можна додати логотип сайту, якщо є
      }
    };
  }

  // 2. Формуємо красивий заголовок
  const title = `${product.name} (${product.oe}) | Купити в м. Горохів`;
  const description = `Оригінальна Б/В запчастина: ${product.name}. Ціна: ${product.price}. Оригінальний номер: ${product.oe}. Стан: ${product.condition}. Відправка по Україні. ☎️ 068 137 40 18`;

  // 3. Повертаємо правильні теги
  return {
    metadataBase: new URL(baseUrl), // <--- ОСЬ ЦЕ ВИПРАВЛЯЄ ПОМИЛКУ FACEBOOK
    title: title,
    description: description,
    
    openGraph: {
      title: title,
      description: description,
      url: `/product/${product.id}`,
      siteName: 'Автопортал - Опель Шрот',
      images: [
        {
          url: product.image, // Просто URL, без ширини/висоти (так надійніше для Facebook)
        },
      ],
      locale: 'uk_UA',
      type: 'website',
    },
  };
}

// --- ОСНОВНИЙ КОМПОНЕНТ ---
export default function Page() {
  return <ProductClient />;
}