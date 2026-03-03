"use client";

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { CartProvider } from '@/context/CartContext';
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="uk">
      <body className={`${inter.className} antialiased bg-gray-50 text-slate-900`}>
        <AnalyticsTracker />
        <CartProvider>
          {/* Показуємо публічні компоненти тільки якщо ми НЕ в адмінці */}
          {!isAdmin && <Header />}

          <main className={isAdmin ? "" : "min-h-screen"}>
            {children}
          </main>

          {!isAdmin && <FloatingContact />}
          {!isAdmin && <Footer />}
        </CartProvider>

      </body>
    </html>
  );
}