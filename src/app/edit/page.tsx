"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mock data для демонстрации
const mockRequests = [
  {
    id: 1,
    object_name: "ЖК \"Солнечный\"",
    order_number: "НЗ 545/204",
    object_address: "ул. Солнечная, 15",
    delivery_datetime: "2024-12-20 14:00:00",
    status: "В работе",
    step1: { object_name: "ЖК \"Солнечный\"", object_address: "ул. Солнечная, 15" },
    step2: { materials: "1. Страховочная привязь – 2 шт;\n2. Страховочный ус – 2 шт;\n3. Жилетка – 2 шт;\n4. Перчатки х/б – 20 пар;\n5. Перчатки зимние – 4 пары;\n6. Перчатки прорезиненные – 10 пар;" },
    step3: { delivery_date: "2024-12-20", delivery_time: "14:00" },
    step4: { contact_name: "Иванов Иван Иванович", contact_phone: "+7 (900) 123-45-67" },
    step5: { additional_info: "Доставить к 13:00, разгрузка с торца здания.\nТребуется предварительный звонок за 30 минут." },
    step6: { photos: [] }
  },
  {
    id: 2,
    object_name: "Офисный центр",
    order_number: "НЗ 546/205",
    object_address: "пр. Центральный, 10",
    delivery_datetime: "2024-12-18 10:00:00",
    status: "Готова",
    step1: { object_name: "Офисный центр", object_address: "пр. Центральный, 10" },
    step2: { materials: "1. Офисная мебель – 5 комплектов;\n2. Компьютеры – 10 шт;\n3. Кабели и провода – 50 м;\n4. Сетевое оборудование – 3 шт." },
    step3: { delivery_date: "2024-12-18", delivery_time: "10:00" },
    step4: { contact_name: "Петров Петр Петрович", contact_phone: "+7 (900) 765-43-21" },
    step5: { additional_info: "Поднять на 5 этаж, лифт работает.\nДоступ через центральный вход." },
    step6: { photos: [] }
  },
  {
    id: 3,
    object_name: "Школа №15",
    order_number: "НЗ 547/206",
    object_address: "ул. Школьная, 5",
    delivery_datetime: "2024-12-22 16:00:00",
    status: "Создана",
    step1: { object_name: "Школа №15", object_address: "ул. Школьная, 5" },
    step2: { materials: "1. Учебники математика – 100 шт;\n2. Учебники русский язык – 100 шт;\n3. Доски учебные – 3 шт;\n4. Мел – 50 упаковок;\n5. Канцелярия – 20 комплектов." },
    step3: { delivery_date: "2024-12-22", delivery_time: "16:00" },
    step4: { contact_name: "Сидорова Анна Сергеевна", contact_phone: "+7 (900) 111-22-33" },
    step5: { additional_info: "Доставить после 15:00.\nОбязательна разгрузка через боковой вход.\nТребуется помощь грузчиков." },
    step6: { photos: [] }
  }
];

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const [selectedRequest, setSelectedRequest] = React.useState<{
    id: number;
    object_name: string;
    order_number: string;
    object_address: string;
    delivery_datetime: string;
    status: string;
    step1: { object_name: string; object_address: string };
    step2: { materials: string };
    step3: { delivery_date: string; delivery_time: string };
    step4: { contact_name: string; contact_phone: string };
    step5: { additional_info: string };
    step6: { photos: string[] };
  } | null>(null);
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editedValue, setEditedValue] = React.useState<string>('');

  React.useEffect(() => {
    if (requestId) {
      const request = mockRequests.find(r => r.id === parseInt(requestId));
      setSelectedRequest(request || null);
    }
  }, [requestId]);

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
        currentValue = selectedRequest.step2?.materials || '';
        break;
      case 'delivery_date':
        currentValue = selectedRequest.delivery_datetime.split(' ')[0];
        break;
      case 'delivery_time':
        currentValue = selectedRequest.delivery_datetime.includes(' 00:00:00') ? '' : selectedRequest.delivery_datetime.split(' ')[1]?.slice(0, 5) || '';
        break;
      case 'contact_name':
        currentValue = selectedRequest.step4?.contact_name || '';
        break;
      case 'contact_phone':
        currentValue = selectedRequest.step4?.contact_phone || '';
        break;
      case 'additional_info':
        currentValue = selectedRequest.step5?.additional_info || '';
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
        updatedRequest.step1.object_name = newValue;
        break;
      case 'object_address':
        updatedRequest.object_address = newValue;
        updatedRequest.step1.object_address = newValue;
        break;
      case 'materials':
        updatedRequest.step2.materials = newValue;
        break;
      case 'delivery_date':
        updatedRequest.step3.delivery_date = newValue;
        // Also update delivery_datetime
        updatedRequest.delivery_datetime = `${newValue} ${updatedRequest.delivery_datetime.split(' ')[1]}`;
        break;
      case 'delivery_time':
        updatedRequest.step3.delivery_time = newValue;
        // Also update delivery_datetime
        updatedRequest.delivery_datetime = `${updatedRequest.delivery_datetime.split(' ')[0]} ${newValue}:00`;
        break;
      case 'contact_name':
        updatedRequest.step4.contact_name = newValue;
        break;
      case 'contact_phone':
        updatedRequest.step4.contact_phone = newValue;
        break;
      case 'additional_info':
        updatedRequest.step5.additional_info = newValue;
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
      'delivery_time': 'Время поставки',
      'contact_name': 'Контактное лицо',
      'contact_phone': 'Телефон',
      'additional_info': 'Дополнительная информация'
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
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Выберите заявку для редактирования</h2>
            <p className="text-xs text-muted-foreground mt-1">Нажмите на заявку, чтобы начать редактирование</p>
          </div>

          <div className="space-y-3">
            {mockRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{request.object_name}</h3>
                    <p className="text-sm text-gray-600">{request.order_number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.delivery_datetime).toLocaleDateString('ru-RU')} • {request.object_address}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'Готова' ? 'bg-green-100 text-green-800' :
                      request.status === 'В работе' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
                  defaultValue={selectedRequest.step2?.materials || "Не указано"}
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
                onClick={() => startEditing('materials', selectedRequest.step2?.materials || "Не указано")}
              >
                <p className="font-medium whitespace-pre-line">
                  {selectedRequest.step2?.materials || "Не указано"}
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
            onClick={() => router.push('/')}
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