import { dummyProducts } from '../../../utils/inventoryData';
import ProductClient from './ProductClient';

// --- ГЕНЕРАЦІЯ МЕТА-ТЕГІВ (SEO) ---
export async function generateMetadata(props) {
  // ФІКС ДЛЯ NEXT.JS 15:
  // Перевіряємо, чи params це Promise, і чекаємо його, якщо треба
  const params = await props.params; 
  
  const id = params.id;

  // --- ЛОГИ ДЛЯ ПЕРЕВІРКИ (Дивись у термінал VS Code) ---
  console.log("========================================");
  console.log("🔎 SEO DEBUG:");
  console.log("👉 Шукаємо ID:", id);
  console.log("📦 Всього товарів у базі:", dummyProducts.length);
  
  // Шукаємо товар
  const product = dummyProducts.find((p) => p.id.toString() === id);
  
  console.log("✅ Знайдено товар:", product ? product.name : "НІЧОГО НЕ ЗНАЙДЕНО");
  console.log("========================================");

  const baseUrl = 'https://auto-portal-demo-ua.vercel.app';

  if (!product) {
    return {
      metadataBase: new URL(baseUrl),
      title: 'Товар не знайдено | Опель Шрот Горохів',
      description: 'Професійна розборка та продаж запчастин',
    };
  }

  const title = `${product.name} (${product.oe}) | Купити в м. Горохів`;
  const description = `Оригінальна Б/В запчастина: ${product.name}. Ціна: ${product.price}. Оригінальний номер: ${product.oe}. Стан: ${product.condition}. Відправка по Україні. ☎️ 068 137 40 18`;

  return {
    metadataBase: new URL(baseUrl),
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `/product/${product.id}`,
      siteName: 'Автопортал - Опель Шрот',
      images: [
        {
          url: product.image,
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