"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, Package, Clock, CheckCircle } from "lucide-react";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Suspense } from "react";

// Mock data для демонстрации
const mockRequests = [
  {
    id_fact: 29,
    object_name: "Изготовление и монтаж ворот",
    order_number: "НЗ 562/2024",
    object_address: "Зайцева",
    delivery_datetime: "2024-10-31 12:44:00",
    status: "Создана",
    materials: "Материалы\n1. Щит (2050400012) - 1 шт, 2. Шина \"N\" (2054303805) - 2 шт, Автоматический выключатель 3-х полюсной 20 А, Кабель 5*2,5 мм (50 метров), Гофрированный металлорукав со склада (по метражу кабеля), крепеж металлорукава (шаг 500 мм, по метражу кабеля)."
  },
  {
    id_fact: 3,
    object_name: "ТГК-1",
    order_number: "НЗ 58",
    object_address: "Мазутный резервуар",
    delivery_datetime: "2024-10-25 12:16:00",
    status: "Создана",
    materials: "Лист ГК толщина 4 мм, размер 6*1,5 метра, 15 тонн, для экономии доставка партиями, кратно листам, а не тоннам."
  }
];

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const [selectedRequest, setSelectedRequest] = React.useState<{
    id_fact: number;
    object_name: string;
    order_number: string;
    object_address: string;
    delivery_datetime: string;
    status: string;
    materials: string;
  } | null>(null);
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editedValue, setEditedValue] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [editRequests, setEditRequests] = React.useState<Array<{
    id_fact: number;
    object_name: string;
    order_number: string;
    object_address: string;
    delivery_datetime: string;
    status: string;
    materials: string;
  }>>([]);

  // Принудительное разворачивание на фулскрин
  React.useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.enableClosingConfirmation();
    }
  }, []);

  // Загружаем данные заявок для редактирования
  React.useEffect(() => {
    loadEditRequestsData();
  }, []);

  React.useEffect(() => {
    if (requestId) {
      const request = editRequests.find(r => r.id_fact === parseInt(requestId));
      setSelectedRequest(request || null);
    }
  }, [requestId, editRequests]);

  // Функция загрузки данных заявок для редактирования
  const loadEditRequestsData = async () => {
    try {
      setIsLoading(true);
      
      // Получаем данные пользователя из Telegram
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      const initData = window.Telegram?.WebApp?.initData;
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      if (!telegramId) {
        console.log('⚠️ Telegram WebApp не обнаружен, используем mock данные');
        // Fallback для локального тестирования
        setEditRequests(mockRequests);
        setIsLoading(false);
        return;
      }

      // Отправляем запрос к n8n для получения данных заявок для редактирования
      const requestData = {
        page: "edit",
        mode: "editlist",
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

      console.log('📤 Отправляем запрос на загрузку заявок для редактирования:', requestData);

      const response = await fetch("https://n8nunit.miaai.ru/webhook/f760ae2e-d95f-4f48-9134-c60aa408372b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Получены данные заявок для редактирования:', data);

      // Обрабатываем ответ от n8n
      if (data.success && data.data && Array.isArray(data.data)) {
        setEditRequests(data.data);
      } else {
        console.log('⚠️ Неожиданный формат ответа, используем mock данные');
        setEditRequests(mockRequests);
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки заявок для редактирования:', error);
      // В случае ошибки используем mock данные
      setEditRequests(mockRequests);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditedValue(currentValue);
  };

  const saveChanges = (field: string, newValue: string) => {
    if (!selectedRequest) return;

    // Получаем текущее значение для сравнения
    let currentValue = '';
    switch (field) {
      case 'order_number':
        currentValue = selectedRequest.order_number;
        break;
      case 'object_name':
        currentValue = selectedRequest.object_name;
        break;
      case 'object_address':
        currentValue = selectedRequest.object_address;
        break;
      case 'materials':
        currentValue = selectedRequest.materials || '';
        break;
      case 'delivery_date':
        currentValue = selectedRequest.delivery_datetime.split(' ')[0];
        break;
      case 'delivery_time':
        currentValue = selectedRequest.delivery_datetime.includes(' 00:00:00') ? '' : selectedRequest.delivery_datetime.split(' ')[1]?.slice(0, 5) || '';
        break;
      default:
        break;
    }

    // Проверяем, изменилось ли значение
    if (currentValue === newValue) {
      setEditingField(null);
      setEditedValue('');
      return; // Ничего не изменилось, не показываем уведомление
    }

    // Обновляем данные
    const updatedRequest = { ...selectedRequest };
    switch (field) {
      case 'order_number':
        updatedRequest.order_number = newValue;
        break;
      case 'object_name':
        updatedRequest.object_name = newValue;
        break;
      case 'object_address':
        updatedRequest.object_address = newValue;
        break;
      case 'materials':
        updatedRequest.materials = newValue;
        break;
      case 'delivery_date':
        // Also update delivery_datetime
        updatedRequest.delivery_datetime = `${newValue} ${updatedRequest.delivery_datetime.split(' ')[1]}`;
        break;
      case 'delivery_time':
        // Also update delivery_datetime
        updatedRequest.delivery_datetime = `${updatedRequest.delivery_datetime.split(' ')[0]} ${newValue}:00`;
        break;
      default:
        break;
    }
    setSelectedRequest(updatedRequest);

    // Показываем уведомление на человеческом языке
    const fieldNames: { [key: string]: string } = {
      'order_number': 'Номер наряд-заказа',
      'object_name': 'Наименование объекта',
      'object_address': 'Адрес объекта',
      'materials': 'Материалы',
      'delivery_date': 'Дата поставки',
      'delivery_time': 'Время поставки'
    };

    toast.success(`${fieldNames[field]} изменен`);
    setEditingField(null);
    setEditedValue('');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditedValue('');
  };

  // Если не выбрана конкретная заявка, показываем список
  if (!selectedRequest) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-1">
        <div className="text-center pt-safe pt-12">
          <h1 className="text-lg font-semibold">Редактирование</h1>
        </div>
        </div>

        {/* Список заявок */}
        <div className="px-4 py-2">
          <div className="rounded-2xl p-4" style={{backgroundColor: '#f8f9fa'}}>
            <h2 className="text-lg font-semibold text-foreground mb-1">Выберите заявку для редактирования</h2>
            <p className="text-xs text-muted-foreground mb-3 leading-tight">
              Нажмите на заявку, чтобы начать редактирование
            </p>

            {/* Экран загрузки */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mb-3"></div>
                <p className="text-sm text-muted-foreground">Загрузка заявок...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {editRequests.map((request) => (
                <div
                  key={request.id_fact}
                  className="p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{request.object_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.delivery_datetime).toLocaleDateString('ru-RU')} • {request.object_address}
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
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-1">
        <div className="text-center pt-safe pt-12">
          <h1 className="text-lg font-semibold">{selectedRequest.object_name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-2">

        <div className="space-y-6">
          {/* 1. Номер наряд-заказа */}
          <div>
            <h3 className="text-sm font-medium mb-3">1. Номер наряд-заказа</h3>
            
            {editingField === 'order_number' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={selectedRequest.order_number}
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 h-12"
                  autoFocus
                  onChange={(e) => setEditedValue(e.target.value)}
                />
                <Button size="sm" onClick={() => saveChanges('order_number', editedValue)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="px-3 py-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 h-12 flex items-center"
                onClick={() => startEditing('order_number', selectedRequest.order_number)}
              >
                <p className="font-medium">{selectedRequest.order_number}</p>
              </div>
            )}
          </div>

          {/* 2. Наименование объекта */}
          <div>
            <h3 className="text-sm font-medium mb-3">2. Наименование объекта</h3>
            
            {editingField === 'object_name' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={selectedRequest.object_name}
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 h-12"
                  autoFocus
                  onChange={(e) => setEditedValue(e.target.value)}
                />
                <Button size="sm" onClick={() => saveChanges('object_name', editedValue)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="px-3 py-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 h-12 flex items-center"
                onClick={() => startEditing('object_name', selectedRequest.object_name)}
              >
                <p className="font-medium">{selectedRequest.object_name}</p>
              </div>
            )}
          </div>

          {/* 3. Адрес объекта */}
          <div>
            <h3 className="text-sm font-medium mb-3">3. Адрес объекта</h3>
            
            {editingField === 'object_address' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={selectedRequest.object_address}
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 h-12"
                  autoFocus
                  onChange={(e) => setEditedValue(e.target.value)}
                />
                <Button size="sm" onClick={() => saveChanges('object_address', editedValue)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="px-3 py-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 h-12 flex items-center"
                onClick={() => startEditing('object_address', selectedRequest.object_address)}
              >
                <p className="font-medium">{selectedRequest.object_address}</p>
              </div>
            )}
          </div>

          {/* 4. Дата поставки */}
          <div>
            <h3 className="text-sm font-medium mb-3">4. Дата поставки</h3>
            
            <div className="flex gap-4">
              {/* Дата доставки */}
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Дата</label>
                {editingField === 'delivery_date' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      defaultValue={selectedRequest.delivery_datetime.split(' ')[0]}
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 h-12"
                      autoFocus
                      onChange={(e) => setEditedValue(e.target.value)}
                    />
                    <Button size="sm" onClick={() => saveChanges('delivery_date', editedValue)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="px-3 py-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 h-12 flex items-center"
                    onClick={() => startEditing('delivery_date', selectedRequest.delivery_datetime.split(' ')[0])}
                  >
                    <p className="font-medium">
                      {new Date(selectedRequest.delivery_datetime).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
              </div>

              {/* Время доставки */}
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Время</label>
                {editingField === 'delivery_time' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      defaultValue={selectedRequest.delivery_datetime.includes(' 00:00:00') ? '' : selectedRequest.delivery_datetime.split(' ')[1]?.slice(0, 5)}
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 h-12"
                      autoFocus
                      onChange={(e) => setEditedValue(e.target.value)}
                    />
                    <Button size="sm" onClick={() => saveChanges('delivery_time', editedValue)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="px-3 py-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 h-12 flex items-center"
                    onClick={() => startEditing('delivery_time', selectedRequest.delivery_datetime.includes(' 00:00:00') ? '' : selectedRequest.delivery_datetime.split(' ')[1]?.slice(0, 5))}
                  >
                    <p className="font-medium">
                      {selectedRequest.delivery_datetime.includes(' 00:00:00') ? 'Не указано' : 
                       selectedRequest.delivery_datetime.split(' ')[1]?.slice(0, 5)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Материалы */}
          <div>
            <h3 className="text-sm font-medium mb-3">5. Необходимые материалы</h3>
            
            {editingField === 'materials' ? (
              <div className="flex items-start gap-2">
                <textarea
                  defaultValue={selectedRequest.materials || "Не указано"}
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 min-h-[120px]"
                  autoFocus
                  onChange={(e) => setEditedValue(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={() => saveChanges('materials', editedValue)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="px-3 py-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 min-h-[120px] flex items-start"
                onClick={() => startEditing('materials', selectedRequest.materials || "Не указано")}
              >
                <p className="font-medium whitespace-pre-line">
                  {selectedRequest.materials || "Не указано"}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3 mt-6 pb-6">
          <Button
            variant="outline"
            className="flex-1 h-12 bg-white border border-gray-200 hover:bg-gray-50"
            onClick={() => setSelectedRequest(null)}
          >
            Отменить
          </Button>
          <Button
            className="flex-1 h-12 bg-black hover:bg-gray-800 text-white"
            onClick={() => {
              toast.success('Изменения сохранены');
              setTimeout(() => router.push('/'), 500);
            }}
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
      </div>
    }>
      <EditPageContent />
    </Suspense>
  );
}