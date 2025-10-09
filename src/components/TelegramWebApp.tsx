"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function TelegramWebApp() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      // Базовая настройка WebApp
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.enableClosingConfirmation();
      
      // Настройка кнопок навигации в зависимости от страницы
      if (pathname === "/") {
        // Главная страница - скрываем кнопки
        window.Telegram.WebApp.MainButton.hide();
        window.Telegram.WebApp.BackButton.hide();
      } else {
        // Подстраницы - показываем кнопку "Назад"
        window.Telegram.WebApp.MainButton.hide();
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
          router.back();
        });
      }
    }
  }, [pathname, router]);

  // Обработчик pull-to-refresh
  useEffect(() => {
    let touchStartY = 0;
    let touchMoveY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      isPulling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      
      touchMoveY = e.touches[0].clientY;
      const pullDistance = touchMoveY - touchStartY;
      
      // Если тянем вниз больше чем на 100px
      if (pullDistance > 100 && window.scrollY === 0) {
        if (!isPulling) {
          isPulling = true;
          // Имитируем перезагрузку
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showPopup({
              title: 'Обновление...',
              message: 'Загружаем актуальные данные',
              buttons: []
            });
          }
          
          // Перезагружаем страницу через небольшую задержку
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartY = 0;
      touchMoveY = 0;
      isPulling = false;
    };

    // Добавляем обработчики только на главной странице
    if (pathname === "/") {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [pathname]);

  return null; // Этот компонент не рендерит ничего
}
