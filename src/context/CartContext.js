"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // 1. Початковий стан ЗАВЖДИ порожній масив (щоб не було помилки Hydration)
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 2. Завантажуємо дані з localStorage тільки коли сайт вже завантажився у браузері
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('shrotCart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Помилка читання кошика:", e);
        }
      }
      setIsInitialized(true); // Ставимо прапорець, що ми завантажились
    }
  }, []);

  // 3. Зберігаємо кошик при кожній зміні, АЛЕ тільки якщо він вже був ініціалізований
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('shrotCart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // Функція: Додати товар
  const addToCart = (product) => {
    setCart((prevCart) => {
      const isExists = prevCart.find((item) => item.id === product.id);
      if (isExists) return prevCart;
      return [...prevCart, product];
    });
  };

  // Функція: Видалити товар
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Функція: Очистити кошик
  const clearCart = () => {
    setCart([]);
  };

  // Рахуємо суму
  const totalAmount = cart.reduce((total, item) => {
    // Безпечно перетворюємо ціну в число (викидаємо все крім цифр)
    const priceString = String(item.price || '0'); 
    const priceNumber = Number(priceString.replace(/\D/g, ''));
    return total + priceNumber;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}