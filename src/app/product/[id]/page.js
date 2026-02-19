import { supabase } from '@/utils/supabase';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation'; // Для 404 ошибки

// Генерация статических путей (оставляем как было)
export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('id');
  return (products || []).map((product) => ({
    id: product.id.toString(),
  }));
}

// Генерация мета-тегов для SEO (оставляем как было, это гуд)
export async function generateMetadata(props) {
  const params = await props.params; 
  const id = params.id;

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  const baseUrl = 'https://auto-portal-demo-ua.vercel.app'; // Твой домен

  if (!product) {
    return {
      title: 'Товар не знайдено',
      description: 'Запчастини Опель',
    };
  }

  // Умный выбор картинки
  const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : product.image;

  return {
    title: `${product.name} (${product.oe}) | Купити в м. Горохів`,
    description: `Оригінальна запчастина ${product.name}. ID: ${product.id}. Ціна: ${product.price} грн.`,
    openGraph: {
      title: product.name,
      description: `Ціна: ${product.price} грн`,
      images: [imageUrl || `${baseUrl}/og-image.jpg`],
    },
  };
}

// === ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ===
export default async function ProductPage(props) {
  const params = await props.params;
  
  // 1. Сервер сам ищет товар
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  // 2. Если товара нет — показываем 404
  if (!product) {
    notFound();
  }

  // 3. Передаем ГОТОВЫЙ товар в компонент. Никаких ожиданий!
  return <ProductClient initialProduct={product} />;
}