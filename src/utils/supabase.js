import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Помилка: Ключі Supabase не знайдені в .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Отримує всі категорії
 */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Помилка при отриманні категорій:', error);
    return [];
  }
  return data;
}

// --- АДМІН-ФУНКЦІЇ ---

// 1. Створення або оновлення категорії
export async function upsertCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .upsert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 2. Видалення категорії
export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 3. Збереження товару (створення або редагування)
export async function saveProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 4. Масові дії (наприклад, видалити декілька)
// Додаємо можливість автоматичного видалення файлів зі Storage
export async function deleteProducts(ids, imageUrls = []) {
  // 1. Видаляємо записи з БД
  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', ids);

  if (error) throw error;

  // 2. Якщо є посилання на фото, видаляємо і їх
  if (imageUrls && imageUrls.length > 0) {
    await deleteFilesFromStorage(imageUrls);
  }

  return true;
}

// Помічник для видалення файлів зі Storage за їх URL
export async function deleteFilesFromStorage(urls) {
  if (!urls || urls.length === 0) return;

  // Екстрактуємо шлях із повного URL
  // Приклад URL: https://xyz.supabase.co/storage/v1/object/public/products/123/img.jpg
  // Шлях для видалення: 123/img.jpg
  const paths = urls.map(url => {
    try {
      const parts = url.split('/storage/v1/object/public/products/');
      return parts.length > 1 ? parts[1] : null;
    } catch (e) {
      return null;
    }
  }).filter(Boolean);

  if (paths.length === 0) return;

  const { error } = await supabase
    .storage
    .from('products')
    .remove(paths);

  if (error) {
    console.error('Помилка видалення фото із Storage:', error);
  }
}

// 5. Масове оновлення статусу
export async function updateProductsStatus(ids, status) {
  const { error } = await supabase
    .from('products')
    .update({ status })
    .in('id', ids);

  if (error) throw error;
  return true;
}

// 6. Масове завантаження (Імпорт)
export async function bulkUpsertProducts(products) {
  const { error } = await supabase
    .from('products')
    .upsert(products);

  if (error) throw error;
  return true;
}

/**
 * Знаходить наступний доступний порядковий номер для SKU
 * Шукає по всій базі (наскрізна нумерація)
 */
export async function getNextSkuNumber() {
  const { data, error } = await supabase
    .from('products')
    .select('sku');

  if (error) {
    console.error('Помилка при отриманні номерів SKU:', error);
    return 1000; // Початковий номер, якщо база порожня
  }

  if (!data || data.length === 0) return 1000;

  // Витягуємо тільки числа з SKU (наприклад 'OP1045' -> 1045)
  const numbers = data.map(p => {
    const match = p.sku?.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }).filter(n => n !== null);

  if (numbers.length === 0) return 1000;

  const maxNumber = Math.max(...numbers);
  return maxNumber + 1;
}

/**
 * Отримує товари з нової схеми
 */
export async function fetchProductsWithDetails(status = 'active') {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Помилка при отриманні товарів:', error);
    return [];
  }
  return data;
}

// --- АНАЛІТИКА ТА ВІДСТЕЖЕННЯ ---

/**
 * Інкремент переглядів товару через RPC
 */
export async function incrementProductViews(id) {
  const { error } = await supabase.rpc('increment_product_views', { p_id: id });
  if (error) console.error('Помилка RPC (views):', error);
}

/**
 * Логування візиту сайту через RPC
 */
export async function logSiteVisit() {
  const { error } = await supabase.rpc('log_site_visit');
  if (error) console.error('Помилка RPC (visit):', error);
}

/**
 * Логування пошукового запиту
 */
export async function logSearchQuery(query) {
  if (!query || query.trim().length < 2) return;
  const { error } = await supabase
    .from('search_logs')
    .insert([{ query: query.trim() }]);
  if (error) console.error('Помилка логування пошуку:', error);
}

/**
 * Отримання даних аналітики для адмінки
 */
export async function fetchAnalyticsData() {
  try {
    // 1. ТОП-5 товарів за переглядами
    const { data: topProducts } = await supabase
      .from('products')
      .select('id, sku, name, views')
      .order('views', { ascending: false })
      .limit(5);

    // 2. Останні 10 пошукових запитів
    const { data: lastSearches } = await supabase
      .from('search_logs')
      .select('query, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // 3. Візити за останні 14 днів
    const { data: visits } = await supabase
      .from('site_visits')
      .select('*')
      .order('visit_date', { ascending: false })
      .limit(14);

    return {
      topProducts: topProducts || [],
      lastSearches: lastSearches || [],
      visits: (visits || []).reverse()
    };
  } catch (error) {
    console.error('Помилка завантаження аналітики:', error);
    return null;
  }
}

/**
 * Очищення старих логів (> 3 місяців)
 */
export async function cleanupOldSearchLogs() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { error } = await supabase
    .from('search_logs')
    .delete()
    .lt('created_at', threeMonthsAgo.toISOString());

  if (error) console.error('Помилка очищення логів:', error);
}
