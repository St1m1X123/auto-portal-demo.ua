import { supabase } from '@/utils/supabase';
import ProductClient from './ProductClient';

export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('id');
  return (products || []).map((product) => ({
    id: product.id.toString(),
  }));
}

// --- ГЕНЕРАЦІЯ МЕТА-ТЕГІВ (SEO) ---
export async function generateMetadata(props) {
  const params = await props.params; 
  const id = params.id;

  const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', id)
  .single();
  
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

  // ВИПРАВЛЕННЯ: Беремо фотку з масиву images або стару image
  const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : product.image;

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
          url: imageUrl || '', // Використовуємо правильне посилання
        },
      ],
      locale: 'uk_UA',
      type: 'website',
    },
  };
}

export default function Page() {
  return <ProductClient />;
}