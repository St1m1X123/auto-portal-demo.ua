import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

export const metadata = {
  title: "Автопортал — Запчастини по всій Україні",
  description: "Професійна розборка та продаж запчастин",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="antialiased">
        <Header />

        <main>
          {children}
        </main>

        {/* ОСЬ ТУТ МИ ЙОГО ДОДАЄМО */}
        <FloatingContact />

        <Footer />
      </body>
    </html>
  );
}