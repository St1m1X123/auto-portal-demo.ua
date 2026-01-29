import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { CartProvider } from '@/context/CartContext';
// 1. Імпортуємо Inter (найчистіший шрифт для інтерфейсів)
import { Inter } from "next/font/google";

// 2. Налаштовуємо його
const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Беремо різні ваги, але без екстремальних
  variable: "--font-inter",
});

export const metadata = {
  title: "Автопортал — Запчастини по всій Україні",
  description: "Професійна розборка та продаж запчастин",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      {/* 3. Застосовуємо шрифт до всього сайту */}
      <body className={`${inter.className} antialiased bg-gray-50 text-slate-900`}>
        
        <CartProvider>
          <Header />

          <main className="min-h-screen">
            {children}
          </main>

          <FloatingContact />
          <Footer />
        </CartProvider>

      </body>
    </html>
  );
}