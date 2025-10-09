"use client"

import { Button } from "@/components/ui/button"
import { Package, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { IconCircleCheckFilled } from "@tabler/icons-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("Все")
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<Array<{
    id: number;
    object_name: string;
    order_number: string;
    object_address: string;
    delivery_datetime: string;
    status: string;
  }>>([])
  const [editableCount, setEditableCount] = useState(0)
  
  // Проверяем URL параметры для показа toast уведомлений
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Небольшая задержка для корректного отображения toast
      setTimeout(() => {
        toast.success('Заявка успешно отправлена!');
      }, 100);
      // Очищаем URL от параметра
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Загружаем данные заявок при загрузке страницы
  useEffect(() => {
    loadRequestsData();
  }, []);

  // Telegram WebApp настройки теперь в TelegramWebApp компоненте

  // Функция загрузки данных заявок
  const loadRequestsData = async () => {
    try {
      setIsLoading(true);
      
      // Получаем данные пользователя из Telegram
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      const initData = window.Telegram?.WebApp?.initData;
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramId) {
        console.log('⚠️ Telegram WebApp не обнаружен, используем mock данные');
        // Fallback для локального тестирования
        setRequests([
          { id: 1, object_name: "ЖК \"Солнечный\"", order_number: "НЗ 545/204", object_address: "ул. Солнечная, 15", delivery_datetime: "2024-12-20 14:00:00", status: "В работе" },
          { id: 2, object_name: "Офисный центр", order_number: "НЗ 546/205", object_address: "пр. Центральный, 10", delivery_datetime: "2024-12-18 10:00:00", status: "Готова" },
          { id: 3, object_name: "Школа №15", order_number: "НЗ 547/206", object_address: "ул. Школьная, 5", delivery_datetime: "2024-12-22 16:00:00", status: "Создана" }
        ]);
        setEditableCount(2);
        setIsLoading(false);
        return;
      }

      // Отправляем запрос к n8n для получения данных заявок
      const requestData = {
        page: "home",
        mode: "main",
        telegram_id: telegramId,
        initData: initData,
        telegram_user: telegramUser ? {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          language_code: telegramUser.language_code,
          is_premium: telegramUser.is_premium,
          photo_url: telegramUser.photo_url
        } : null,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Отправляем запрос на загрузку заявок:', requestData);

      const response = await fetch("https://n8nunit.miaai.ru/webhook/f760ae2e-d95f-4f48-9134-c60aa408372b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Получены данные заявок:', data);

      // Обрабатываем ответ от n8n
      if (data.success) {
        setRequests(data.requests || []);
        setEditableCount(data.editableCount || 0);
      } else {
        console.error('❌ Ошибка получения данных:', data.error);
        toast.error('Ошибка загрузки данных заявок');
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      toast.error('Ошибка загрузки данных заявок');
      
      // Fallback данные при ошибке
      setRequests([
        { id: 1, object_name: "ЖК \"Солнечный\"", order_number: "НЗ 545/204", object_address: "ул. Солнечная, 15", delivery_datetime: "2024-12-20 14:00:00", status: "В работе" },
        { id: 2, object_name: "Офисный центр", order_number: "НЗ 546/205", object_address: "пр. Центральный, 10", delivery_datetime: "2024-12-18 10:00:00", status: "Готова" }
      ]);
      setEditableCount(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Фильтрация заявок по статусу
  const filteredRequests = activeFilter === "Все" 
    ? requests 
    : requests.filter(request => {
        if (activeFilter === "Создана") return request.status === "Создана"
        if (activeFilter === "В работе") return request.status === "В работе"
        if (activeFilter === "Готова") return request.status === "Готова"
        return true
      })
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-1">
        <div className="text-center pt-safe pt-12">
          <div className="flex items-center justify-center">
            <div className="w-40 h-10 flex items-end justify-center">
        <Image
                src="/logo.png" 
                alt="Вектор РК" 
                width={120} 
                height={40} 
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* News Stories */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* News Story 1 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center" 
                alt="Новости"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Новости
              </div>
            </div>
          </div>

          {/* News Story 2 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&crop=center" 
                alt="Объявления"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Объявления
              </div>
            </div>
          </div>

          {/* News Story 3 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=80&h=80&fit=crop&crop=center" 
                alt="Достижения"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Достижения
              </div>
            </div>
          </div>

          {/* News Story 4 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&h=80&fit=crop&crop=center" 
                alt="Команда"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Команда
              </div>
            </div>
          </div>

          {/* News Story 5 */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&crop=center" 
                alt="Рост"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Рост
              </div>
            </div>
          </div>

          {/* News Story 6 - Строительство */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&h=80&fit=crop&crop=center" 
                alt="Строительство"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Строительство
              </div>
            </div>
          </div>

          {/* News Story 7 - Оборудование */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=80&h=80&fit=crop&crop=center" 
                alt="Оборудование"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Оборудование
              </div>
            </div>
          </div>

          {/* News Story 8 - Безопасность */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=80&h=80&fit=crop&crop=center" 
                alt="Безопасность"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Безопасность
              </div>
            </div>
          </div>

          {/* News Story 9 - Логистика */}
          <div className="min-w-[80px] aspect-square bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            <div className="w-full h-full relative">
              <Image 
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=80&h=80&fit=crop&crop=center" 
                alt="Логистика"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Логистика
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Left column - 2 buttons */}
          <div>
            <Link href="/analytics">
              <Button variant="outline" className="w-full h-24 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm relative rounded-2xl p-3 mb-3">
                <div className="flex flex-col items-start justify-start w-full h-full">
                  <div className="text-left w-full">
                    <div className="text-lg font-bold text-gray-900 truncate">Все заявки</div>
                    <div className="text-sm text-gray-500 mt-1 truncate">Посмотреть статистику</div>
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/edit">
              <Button variant="outline" className="w-full h-24 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm relative rounded-2xl p-3">
                <div className="flex flex-col items-start justify-start w-full h-full">
                  <div className="text-left w-full pr-8">
                    <div className="text-lg font-bold text-gray-900 truncate">Править</div>
                    <div className="text-sm text-gray-500 mt-1 truncate">Внести изменения</div>
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {editableCount}
                  </div>
                </div>
              </Button>
            </Link>
          </div>
          
          {/* Right column - Add button */}
          <div>
            <Link href="/request">
              <Button className="w-full h-[204px] bg-black hover:bg-gray-800 text-white text-base font-semibold relative p-6 rounded-2xl">
                <div className="absolute top-4 left-4 text-left">
                  <div className="text-lg font-bold leading-tight">Добавить</div>
                  <div className="text-lg font-bold leading-tight">заявку</div>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-black stroke-[3]" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="px-4 py-2">
        <div className="rounded-2xl p-4" style={{backgroundColor: '#f8f9fa'}}>
          <h2 className="text-lg font-semibold text-foreground mb-1">Последние заявки</h2>
          <p className="text-xs text-muted-foreground mb-3 leading-tight">
            Отслеживайте статус ваших заявок
          </p>
          
          {/* Экран загрузки */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mb-3"></div>
              <p className="text-sm text-muted-foreground">Загрузка заявок...</p>
            </div>
          ) : (
            <>
        <div className="mb-4 px-4">
          <div className="flex items-center justify-center gap-1 rounded-lg p-1 w-full max-w-sm mx-auto" style={{backgroundColor: '#e9ecef'}}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-2 text-xs font-medium flex items-center gap-1 flex-1 ${
                activeFilter === "Все" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Все")}
            >
              Все
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-2 text-xs font-medium flex items-center gap-1 flex-1 ${
                activeFilter === "Создана" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Создана")}
            >
              <span className="truncate">Создана</span>
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {requests.filter(r => r.status === "Создана").length}
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-2 text-xs font-medium flex items-center gap-1 flex-1 ${
                activeFilter === "В работе" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("В работе")}
            >
              <span className="truncate">В работе</span>
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {requests.filter(r => r.status === "В работе").length}
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 px-2 text-xs font-medium flex items-center gap-1 flex-1 ${
                activeFilter === "Готова" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-600 hover:bg-white"
              }`}
              onClick={() => setActiveFilter("Готова")}
            >
              <span className="truncate">Готова</span>
              <div className="w-4 h-4 bg-gray-300 text-gray-700 text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {requests.filter(r => r.status === "Готова").length}
              </div>
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          {filteredRequests.map((request) => (
            <div key={request.id} className="p-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{request.object_name}</div>
                        <div className="text-xs text-muted-foreground">
                        {(() => {
                          const date = new Date(request.delivery_datetime);
                          const hours = date.getHours();
                          const minutes = date.getMinutes();
                          const showTime = hours !== 0 || minutes !== 0;
                          
                          return showTime 
                            ? date.toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : date.toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                        })()}
                        <br />
                        {request.object_address}
                        <br />
                        {request.order_number}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground border border-gray-200">
                      {request.status === "В работе" ? (
                        <Clock className="h-3 w-3 mr-1 text-orange-500" />
                      ) : request.status === "Готова" ? (
                        <IconCircleCheckFilled className="h-3 w-3 mr-1 fill-green-500 dark:fill-green-400" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1 text-blue-500" />
                      )}
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
          ))}
        </div>
            </>
          )}
        </div>
      </div>


      {/* Bottom padding for mobile */}
      <div className="h-6"></div>
    </div>
  );
}
