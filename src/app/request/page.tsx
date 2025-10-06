"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Calendar, Camera, Check, X, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function RequestPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    orderNumber: "",
    objectName: "",
    objectAddress: "",
    deliveryDate: null as Date | null,
    deliveryTime: "",
    materials: "",
    photos: [] as string[]
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [telegramDebug, setTelegramDebug] = useState<string>('')
  
  // Состояние для хранения file_id от Telegram
  const [telegramFiles, setTelegramFiles] = useState<Array<{
    index: number;
    fileId: string;
    fileName: string;
  }>>([])

  // Инициализация Telegram WebApp (как в sellerkit)
  useEffect(() => {
    const initTelegramWebApp = async () => {
      console.log('🔍 Проверяем инициализацию Telegram WebApp...');
      console.log('window.Telegram:', window.Telegram);
      console.log('window.Telegram?.WebApp:', window.Telegram?.WebApp);
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        console.log('📱 initData:', window.Telegram.WebApp.initData);
        console.log('📱 initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
        console.log('📱 WebApp version:', window.Telegram.WebApp.version);
        console.log('📱 WebApp platform:', window.Telegram.WebApp.platform);
        
        const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
        const telegramId = telegramUser?.id;
        
        console.log('📱 Telegram User:', telegramUser);
        console.log('📱 Telegram ID:', telegramId);
        
        // Устанавливаем отладочную информацию
        const debugInfo = `Telegram ID: ${telegramId || 'не найден'} | initData: ${window.Telegram.WebApp.initData ? 'есть' : 'нет'}`;
        setTelegramDebug(debugInfo);
        console.log('📱 Telegram Debug:', debugInfo);
        
        // Инициализация WebApp
        try {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          console.log('✅ Telegram WebApp инициализирован');
        } catch (error) {
          console.error('❌ Ошибка инициализации WebApp:', error);
        }
        
        // Сохраняем Telegram ID в localStorage
        if (telegramId) {
          localStorage.setItem('telegram_id', telegramId.toString());
          console.log('💾 Telegram ID сохранен в localStorage:', telegramId);
          
          // ★ NEW: Отправка данных в n8n webhook (как в sellerkit)
          try {
            const dataToSend = {
              page: "request-form",
              mode: "initialized",
              telegram_id: telegramId,
              initData: window.Telegram.WebApp.initData,
              telegram_user: telegramUser ? {
                id: telegramUser.id,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                language_code: telegramUser.language_code,
                is_premium: telegramUser.is_premium,
                photo_url: telegramUser.photo_url
              } : null,
              timestamp: new Date().toISOString(),
              action: "webapp_initialized"
            };
            
            // Отправляем в n8n webhook
            const response = await fetch("https://n8nunit.miaai.ru/webhook/f760ae2e-d95f-4f48-9134-c60aa408372b", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dataToSend),
            });
            
            console.log('📤 Данные отправлены в n8n webhook:', dataToSend);
            console.log('📦 Ответ от n8n:', await response.json());
            
            // По желанию — параллельно слать боту:
            window.Telegram.WebApp.sendData(JSON.stringify({
              telegram_id: telegramId,
              action: 'webapp_initialized'
            }));
          } catch (error) {
            console.error('❌ Ошибка отправки в n8n:', error);
          }
        }
        } else {
          // Fallback для локального тестирования
          const mockTelegramId = 123456789; // Тестовый ID
          setTelegramDebug(`Локальное тестирование | Mock ID: ${mockTelegramId}`);
          console.log('⚠️ Telegram WebApp не обнаружен, используем mock данные для тестирования');
          
          // Сохраняем mock ID в localStorage для тестирования
          localStorage.setItem('telegram_id', mockTelegramId.toString());
        }
    };
    
    initTelegramWebApp();
  }, [])
  const [calendarOpen, setCalendarOpen] = useState(false)

  const steps = [
    { number: 1, title: "Введите номер наряд-заказа", placeholder: "НЗ 545/204", field: "orderNumber" },
    { number: 2, title: "Введите наименование объекта", placeholder: "Университетский лицей", field: "objectName" },
    { number: 3, title: "Введите адрес объекта", placeholder: "наб. Варкауса, 15", field: "objectAddress" },
    { number: 4, title: "Введите дату поставки", placeholder: "10.12.2024 16:10", field: "deliveryDate" },
    { number: 5, title: "Необходимые материалы", placeholder: "1. Страховочная привязь – 2 шт;\n2. Страховочный ус – 2 шт;\n3. Жилетка – 2 шт;\n4. Перчатки х/б – 20 пар;\n5. Перчатки зимние – 4 пары;\n6. Перчатки прорезиненные – 10 пар;", field: "materials" },
    { number: 6, title: "Отправьте фото", placeholder: "Добавьте фотографии", field: "photos" }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Функция для получения Telegram данных (как в sellerkit)
  const getTelegramData = () => {
    let telegramId = null;
    let initData = null;
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // Получаем initData для валидации
      initData = window.Telegram.WebApp.initData || null;
      
      // Способ 1: через initDataUnsafe
      if (window.Telegram.WebApp.initDataUnsafe?.user?.id) {
        telegramId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      }
      
      // Способ 2: через initData (строка) - если не нашли через initDataUnsafe
      if (!telegramId && initData) {
        try {
          const params = new URLSearchParams(initData);
          const userParam = params.get('user');
          if (userParam) {
            const user = JSON.parse(decodeURIComponent(userParam));
            if (user.id) {
              telegramId = user.id.toString();
            }
          }
        } catch (error) {
          console.error('Ошибка парсинга initData:', error);
        }
      }
      
      // Способ 3: через localStorage (если сохранен ранее)
      if (!telegramId) {
        const savedTelegramId = localStorage.getItem('telegram_id');
        if (savedTelegramId) {
          telegramId = savedTelegramId;
        }
      }
    }
    
    console.log('🔍 getTelegramData:', { telegram_id: telegramId, initData: initData ? 'есть' : 'нет' });
    return { telegram_id: telegramId, initData };
  }

  // Функция для конвертации blob URL в base64

  const handleSubmitRequest = async () => {
    try {
      const { telegram_id, initData } = getTelegramData();
      
      // Получаем московское время
      const moscowTime = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Проверяем, есть ли Telegram WebApp (как в sellerkit)
      const isTelegramWebApp = typeof window !== 'undefined' && 
        window.Telegram && 
        window.Telegram.WebApp && 
        typeof window.Telegram.WebApp.sendData === 'function';
      
      // Получаем информацию о пользователе Telegram (как в sellerkit)
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      
      // Отправляем данные через Telegram WebApp
      const requestData = {
        request: {
          orderNumber: formData.orderNumber,
          objectName: formData.objectName,
          objectAddress: formData.objectAddress,
          deliveryDate: formData.deliveryDate ? format(formData.deliveryDate, "dd.MM.yyyy", { locale: ru }) : null,
          deliveryTime: formData.deliveryTime,
          materials: formData.materials,
          photos: formData.photos // Отправляем blob URLs напрямую
        },
        timestamp: moscowTime,
        page: "request-form",
        mode: "submit",
        telegram_id: telegram_id,
        initData: initData,
        // ★ Добавляем полную информацию о пользователе Telegram
        telegram_user: telegramUser ? {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          language_code: telegramUser.language_code,
          is_premium: telegramUser.is_premium,
          photo_url: telegramUser.photo_url
        } : null
      };

      // Отладочная информация
      console.log('🔍 Проверка Telegram WebApp:');
      console.log('🔍 window.Telegram:', !!window.Telegram);
      console.log('🔍 window.Telegram.WebApp:', !!window.Telegram?.WebApp);
      console.log('🔍 sendData function:', typeof window.Telegram?.WebApp?.sendData);
      console.log('🔍 isTelegramWebApp:', isTelegramWebApp);
      console.log('👤 Telegram User:', telegramUser);
      console.log('📤 Request Data:', requestData);

      if (isTelegramWebApp) {
        // Используем Telegram WebApp для отправки файлов
        console.log('📱 Используем Telegram WebApp для отправки файлов...');
        
      // Используем уже загруженные file_id (фото загружаются сразу при выборе)
      const updatedRequestData = {
        ...requestData,
        request: {
          ...requestData.request,
          photos: telegramFiles // Используем уже загруженные file_id
        }
      };
      
      console.log('📤 Используем уже загруженные file_id:', telegramFiles);

      // Отправляем данные в n8n webhook (как в sellerkit)
      try {
        const response = await fetch("https://n8nunit.miaai.ru/webhook/f760ae2e-d95f-4f48-9134-c60aa408372b", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRequestData),
        });
        
        console.log('📤 Заявка отправлена в n8n webhook:', updatedRequestData);
        console.log('📦 Статус ответа от n8n:', response.status);
        
        // Проверяем статус ответа
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Проверяем, есть ли контент для парсинга
        const responseText = await response.text();
        console.log('📦 Текст ответа от n8n:', responseText);
        
        if (responseText.trim()) {
          try {
            const responseData = JSON.parse(responseText);
            console.log('📦 JSON ответ от n8n:', responseData);
          } catch {
            console.warn('⚠️ Ответ от n8n не является валидным JSON:', responseText);
          }
        } else {
          console.log('📦 Пустой ответ от n8n (это нормально)');
        }
        
        alert('Заявка отправлена через Telegram!');
        window.location.href = '/';
        return;
      } catch (error) {
        console.error('❌ Ошибка отправки в n8n:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        alert(`Ошибка при отправке заявки: ${errorMessage}. Попробуйте еще раз.`);
        return;
      }
      } else {
        // Fallback: для обычного браузера показываем сообщение
        console.log('⚠️ Telegram WebApp не обнаружен, показываем сообщение');
        alert('Это приложение предназначено для использования в Telegram. Пожалуйста, откройте его через Telegram бота.');
        return;
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке заявки:', error);
      console.error('❌ Тип ошибки:', error instanceof Error ? error.constructor.name : 'Unknown');
      console.error('❌ Сообщение ошибки:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Стек ошибки:', error instanceof Error ? error.stack : 'No stack trace');
      
      alert(`Ошибка при отправке заявки: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowConfirmation(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Проверяем размер файлов (максимум 2MB на файл)
      const maxSize = 2 * 1024 * 1024; // 2MB
      const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert(`Некоторые файлы слишком большие (максимум 2MB). Пропущено файлов: ${oversizedFiles.length}`);
      }
      
      // Фильтруем файлы по размеру
      const validFiles = Array.from(files).filter(file => file.size <= maxSize);
      
      if (validFiles.length === 0) {
        alert('Все файлы слишком большие. Максимальный размер: 2MB');
        return;
      }
      
      // Создаем blob URLs для превью
      const newPhotos = validFiles.map(file => URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
      
      // Загружаем файлы в Telegram Bot API и получаем настоящие file_id
      console.log('📸 Начинаем загрузку фото в Telegram Bot API...')
      
      try {
        // Отправляем файлы в Telegram Bot API
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          
          // Конвертируем файл в base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          
          // Отправляем в наш API роут, который загрузит в Telegram Bot API
          const uploadResponse = await fetch('/api/telegram-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64,
              fileName: file.name,
              orderNumber: formData.orderNumber || 'Без номера',
              objectName: formData.objectName || 'Без объекта'
            }),
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            if (result.success && result.file_id) {
              // Сохраняем НАСТОЯЩИЙ file_id от Telegram
              setTelegramFiles(prev => [...prev, {
                index: prev.length,
                fileId: result.file_id, // Настоящий file_id от Telegram
                fileName: file.name
              }]);
              console.log('✅ Фото загружено в Telegram Bot API:', result.file_id);
            } else {
              console.error('❌ Ошибка загрузки:', result.error);
              alert(`Ошибка загрузки фото: ${result.error}`);
            }
          } else {
            const errorText = await uploadResponse.text();
            console.error('❌ HTTP ошибка загрузки:', errorText);
            alert('Ошибка при загрузке фото в Telegram');
          }
        }
      } catch (error) {
        console.error('❌ Ошибка при загрузке фото в Telegram Bot API:', error)
        alert('Ошибка при загрузке фото. Попробуйте еще раз.');
      }
    }
  }

  // Telegram WebApp file upload
  const handleTelegramPhotoUpload = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // Проверяем, поддерживается ли showPopup в текущей версии
      if (typeof window.Telegram.WebApp.showPopup === 'function') {
        try {
          window.Telegram.WebApp.showPopup({
            title: 'Выберите фото',
            message: 'Выберите фотографии для заявки',
            buttons: [
              {
                id: 'camera',
                type: 'default',
                text: 'Камера'
              },
              {
                id: 'gallery',
                type: 'default', 
                text: 'Галерея'
              },
              {
                id: 'cancel',
                type: 'cancel',
                text: 'Отмена'
              }
            ]
          }, (buttonId) => {
            if (buttonId === 'camera' || buttonId === 'gallery') {
              // Открываем нативный интерфейс выбора файлов
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
                  setFormData(prev => ({
                    ...prev,
                    photos: [...prev.photos, ...newPhotos]
                  }));
                }
              };
              input.click();
            }
          });
        } catch (error) {
          console.warn('⚠️ showPopup не поддерживается, используем fallback:', error);
          // Fallback: открываем стандартный input
          const input = document.getElementById('photo-upload') as HTMLInputElement;
          input?.click();
        }
      } else {
        console.log('📱 showPopup не поддерживается в версии', window.Telegram.WebApp.version);
        // Fallback: открываем стандартный input
        const input = document.getElementById('photo-upload') as HTMLInputElement;
        input?.click();
      }
    } else {
      // Fallback для обычного браузера
      const input = document.getElementById('photo-upload') as HTMLInputElement;
      input?.click();
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    
    // Также удаляем соответствующий file_id
    setTelegramFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && currentStep < 6) {
      nextStep()
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b border-border px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-3" onClick={() => setShowConfirmation(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Подтверждение заявки</h1>
              <p className="text-sm text-muted-foreground">Проверьте данные перед отправкой</p>
            </div>
          </div>
        </div>

        {/* Отладочная информация для Telegram */}
        <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mx-4 mt-2">
          <div className="text-xs text-yellow-800">
            🔍 Отладка: {telegramDebug}
          </div>
          {telegramFiles.length > 0 && (
            <div className="text-xs text-green-800 mt-1">
              📸 Загружено фото в Telegram Bot API: {telegramFiles.length} шт.
              {telegramFiles.map((file, index) => (
                <div key={index} className="ml-2">
                  • Фото {file.index}: {file.fileId.substring(0, 20)}...
                </div>
              ))}
              <div className="text-xs text-blue-800 mt-1">
                📤 Настоящие File IDs от Telegram (для отправки в n8n):
                {telegramFiles.map((file, index) => (
                  <div key={index} className="ml-2 font-mono">
                    • {file.fileId}
                  </div>
                ))}
              </div>
            </div>
          )}
          {telegramFiles.length === 0 && (
            <div className="text-xs text-gray-600 mt-1">
              📸 Фото не загружены
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Данные заявки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Номер наряд-заказа</Label>
                <p className="text-base">{formData.orderNumber || "Не указано"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Наименование объекта</Label>
                <p className="text-base">{formData.objectName || "Не указано"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Адрес объекта</Label>
                <p className="text-base">{formData.objectAddress || "Не указано"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Дата поставки</Label>
                <p className="text-base">
                  {formData.deliveryDate 
                    ? `${format(formData.deliveryDate, "dd.MM.yyyy", { locale: ru })}${formData.deliveryTime ? ` ${formData.deliveryTime}` : ''}`
                    : "Не указано"
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Материалы</Label>
                <p className="text-base">{formData.materials || "Не указано"}</p>
              </div>
              {formData.photos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Фотографии</Label>
                  <div className="flex gap-2 mt-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 pb-6">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setShowConfirmation(false)}>
              Редактировать
            </Button>
            <Button className="flex-1 h-12" onClick={handleSubmitRequest}>
              <Check className="h-4 w-4 mr-2" />
              Отправить заявку
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-4">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Новая заявка</h1>
            <p className="text-sm text-muted-foreground">Шаг {currentStep}/6</p>
          </div>
        </div>
      </div>

      {/* Отладочная информация для Telegram */}
      <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mx-4 mt-2">
        <div className="text-xs text-yellow-800">
          🔍 Отладка: {telegramDebug}
        </div>
        {telegramFiles.length > 0 && (
          <div className="text-xs text-green-800 mt-1">
            📸 Загружено фото в Telegram Bot API: {telegramFiles.length} шт.
            {telegramFiles.map((file, index) => (
              <div key={index} className="ml-2">
                • Фото {file.index}: {file.fileId.substring(0, 20)}...
              </div>
            ))}
            <div className="text-xs text-blue-800 mt-1">
              📤 Настоящие File IDs от Telegram (для отправки в n8n):
              {telegramFiles.map((file, index) => (
                <div key={index} className="ml-2 font-mono">
                  • {file.fileId}
                </div>
              ))}
            </div>
          </div>
        )}
        {telegramFiles.length === 0 && (
          <div className="text-xs text-gray-600 mt-1">
            📸 Фото не загружены
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              [{currentStep}/6] {currentStepData.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentStep === 6 
                ? "Можно пропустить шаг, нажав на кнопку \"Завершить\""
                : currentStep === 5
                ? "Укажите необходимые материалы списком"
                : `Например, "${currentStepData.placeholder}"`
              }
            </p>
          </CardHeader>
          <CardContent>
            {currentStep === 4 ? (
              <div className="space-y-4 min-h-[200px] flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
                  <Label className="text-sm font-medium mb-2 block">Выберите дату</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.deliveryDate ? (
                          format(formData.deliveryDate, "dd.MM.yyyy", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.deliveryDate || undefined}
                        onSelect={(date) => {
                          setFormData(prev => ({ ...prev, deliveryDate: date || null }))
                          setCalendarOpen(false)
                        }}
                        initialFocus
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
            </div>
            <div className="flex-1 flex flex-col justify-center">
                  <Label className="text-sm font-medium mb-2 block">Время (необязательно)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                      type="time"
                      placeholder="16:10"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12"
              />
            </div>
            </div>
            </div>
            ) : currentStep === 5 ? (
              <div className="min-h-[200px] flex flex-col">
              <Textarea 
                  placeholder={currentStepData.placeholder}
                  value={formData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-32"
              />
            </div>
            ) : currentStep === 6 ? (
              <div className="space-y-4 min-h-[200px]">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Добавьте фотографии</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button onClick={handleTelegramPhotoUpload}>
                    Выбрать фото
                    </Button>
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-lg object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[200px] flex flex-col">
                <Input
                  placeholder={currentStepData.placeholder}
                  value={formData[currentStepData.field as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pb-6">
          {currentStep > 1 && (
            <Button variant="outline" className="flex-1 h-12" onClick={prevStep}>
              Назад
          </Button>
          )}
          <Button className="flex-1 h-12" onClick={nextStep}>
            {currentStep === 6 ? "Завершить" : "Далее"}
          </Button>
        </div>
      </div>
    </div>
  )
}
