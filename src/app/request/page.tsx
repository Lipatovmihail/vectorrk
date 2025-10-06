"use client"

import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"

// утилита: Blob -> base64
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

// утилита: File -> сжатый Blob (JPEG), < targetBytes
async function compressImage(
  file: File,
  {
    targetBytes = 1_500_000,       // ~1.5 МБ целевой размер
    maxSide = 1600,                // длинная сторона (px)
    initialQuality = 0.85,         // стартовое качество JPEG
    minQuality = 0.5               // минимально допустимое
  } = {}
): Promise<Blob> {
  // HEIC/HEIF лучше конвертить в JPEG (canvas не всегда умеет HEIC)
  const mimeFallback = 'image/jpeg';

  // Загружаем картинку с учётом EXIF-ориентации
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(async () => {
    // fallback через <img>
    const src = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const i = new (window as any).Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const b = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), mimeFallback, 1));
    URL.revokeObjectURL(src);
    return createImageBitmap(b);
  });

  const { width, height } = bitmap;
  let scale = Math.min(1, maxSide / Math.max(width, height));
  let w = Math.max(1, Math.round(width * scale));
  let h = Math.max(1, Math.round(height * scale));

  // Создаём холст (OffscreenCanvas, если доступен)
  const makeCanvas = (w: number, h: number) => {
    if ('OffscreenCanvas' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new (window as any).OffscreenCanvas(w, h) as OffscreenCanvas;
    }
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  };

  let quality = initialQuality;
  let blob: Blob;

  for (let i = 0; i < 8; i++) { // до 8 итераций (качество/размер)
    const canvas = makeCanvas(w, h);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (canvas as any).getContext('2d') as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
    ctx.drawImage(bitmap, 0, 0, w, h);

    blob = 'convertToBlob' in canvas
      ? await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/jpeg', quality })
      : await new Promise<Blob>((res) => (canvas as HTMLCanvasElement).toBlob(b => res(b!), 'image/jpeg', quality));

    if (blob.size <= targetBytes) break;

    // сначала опускаем качество, потом уменьшаем габариты
    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1);
    } else {
      scale *= 0.85; // уменьшаем ширину/высоту
      w = Math.max(320, Math.round(w * 0.85));
      h = Math.max(320, Math.round(h * 0.85));
    }
  }

  return blob!;
}

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
  
  // Состояние для хранения file_id от Telegram
  const [telegramFiles, setTelegramFiles] = useState<Array<{
    index: number;
    fileId: string;
    fileName: string;
  }>>([])
  
  // Состояние для отслеживания прогресса загрузки каждого фото
  const [uploadProgress, setUploadProgress] = useState<Array<{
    fileName: string;
    status: 'compressing' | 'uploading' | 'completed' | 'error';
    progress?: number;
    error?: string;
  }>>([])
  
  // Состояние для блокировки кнопок во время загрузки
  const [isUploading, setIsUploading] = useState(false)

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
        
        console.log('📱 Telegram Debug:', `Telegram ID: ${telegramId || 'не найден'} | initData: ${window.Telegram.WebApp.initData ? 'есть' : 'нет'}`);
        
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
        
        toast.success('Заявка успешно отправлена!');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      } catch (error) {
        console.error('❌ Ошибка отправки в n8n:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        toast.error(`Ошибка при отправке заявки: ${errorMessage}. Попробуйте еще раз.`);
        return;
      }
      } else {
        // Fallback: для обычного браузера показываем сообщение
        console.log('⚠️ Telegram WebApp не обнаружен, показываем сообщение');
        toast.warning('Это приложение предназначено для использования в Telegram. Пожалуйста, откройте его через Telegram бота.');
        return;
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке заявки:', error);
      console.error('❌ Тип ошибки:', error instanceof Error ? error.constructor.name : 'Unknown');
      console.error('❌ Сообщение ошибки:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Стек ошибки:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast.error(`Ошибка при отправке заявки: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Общий обработчик файлов (и превью, и загрузка в Telegram → file_id)
  const processFilesAndUpload = async (files: FileList) => {
    // Блокируем кнопки во время загрузки
    setIsUploading(true);
    
    // Показываем превью сразу (из исходников)
    const previews = Array.from(files).map(f => URL.createObjectURL(f));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...previews] }));

    // Инициализируем прогресс для всех файлов
    const fileArray = Array.from(files);
    const currentPhotoCount = formData.photos.length;
    
    setUploadProgress(prev => [
      ...prev,
      ...fileArray.map(file => ({
        fileName: file.name,
        status: 'compressing' as const
      }))
    ]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const progressIndex = currentPhotoCount + i; // Правильный индекс в общем массиве
      
      try {
        console.log(`📸 Обрабатываем файл: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} МБ)`);
        
        // Обновляем статус: сжатие
        setUploadProgress(prev => prev.map((item, idx) => 
          idx === progressIndex ? { ...item, status: 'compressing' } : item
        ));
        
        // 1) сжимаем "под капотом"
        const compressed = await compressImage(file, {
          targetBytes: 1_600_000, // ≈1.6 МБ — комфортно для JSON base64
          maxSide: 1600,          // визуально ок на телефоне
          initialQuality: 0.85
        });

        console.log(`📦 Сжато до: ${(compressed.size / 1024 / 1024).toFixed(1)} МБ`);

        // Обновляем статус: загрузка
        setUploadProgress(prev => prev.map((item, idx) => 
          idx === progressIndex ? { ...item, status: 'uploading' } : item
        ));

        // 2) конвертим в base64
        const base64 = await blobToBase64(compressed);

        // 3) шлём в Telegram API (твой роут /api/telegram-upload)
        const resp = await fetch('/api/telegram-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            fileName: file.name.replace(/\.(heic|heif)$/i, '.jpg'),
            orderNumber: formData.orderNumber || 'Без номера',
            objectName: formData.objectName || 'Без объекта'
          }),
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('TG upload failed:', errorText);
          
          // Обновляем статус: ошибка
          setUploadProgress(prev => prev.map((item, idx) => 
            idx === progressIndex ? { ...item, status: 'error', error: 'Ошибка загрузки в Telegram' } : item
          ));
          
          toast.error('Ошибка при загрузке фото в Telegram');
          continue;
        }
        
        const data = await resp.json();
        if (data.success && data.file_id) {
          setTelegramFiles(prev => [...prev, {
            index: prev.length,
            fileId: data.file_id,
            fileName: file.name
          }]);
          
          // Обновляем статус: завершено
          setUploadProgress(prev => prev.map((item, idx) => 
            idx === progressIndex ? { ...item, status: 'completed' } : item
          ));
          
          console.log('✅ Фото загружено в Telegram Bot API:', data.file_id);
          toast.success(`Фото "${file.name}" успешно загружено`);
        } else {
          console.error('TG API error:', data.error);
          
          // Обновляем статус: ошибка
          setUploadProgress(prev => prev.map((item, idx) => 
            idx === progressIndex ? { ...item, status: 'error', error: data.error || 'Неизвестная ошибка' } : item
          ));
          
          toast.error(`Ошибка загрузки фото: ${data.error || 'Неизвестная ошибка'}`);
        }
      } catch (error) {
        console.error('❌ Ошибка при обработке файла:', error);
        
        // Обновляем статус: ошибка
        setUploadProgress(prev => prev.map((item, idx) => 
          idx === progressIndex ? { 
            ...item, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
          } : item
        ));
        
        toast.error(`Ошибка при обработке файла ${file.name}`);
      }
    }
    
    // Разблокируем кнопки после завершения всех загрузок
    setIsUploading(false);
    
    // Показываем общий toast о завершении загрузки
    const completedCount = uploadProgress.filter(p => p.status === 'completed').length;
    const totalCount = uploadProgress.length;
    
    if (completedCount > 0) {
      toast.success(`Загружено ${completedCount} из ${totalCount} фото`);
    }
  };

  // Скрытый инпут использует общий обработчик
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) await processFilesAndUpload(event.target.files);
  }

  // Telegram WebApp file upload
  const handleTelegramPhotoUpload = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      if (typeof window.Telegram.WebApp.showPopup === 'function') {
        window.Telegram.WebApp.showPopup({
          title: 'Выберите фото',
          message: 'Выберите фотографии для заявки',
          buttons: [
            { id: 'camera', type: 'default', text: 'Камера' },
            { id: 'gallery', type: 'default', text: 'Галерея' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
          ]
        }, (buttonId) => {
          if (buttonId === 'camera' || buttonId === 'gallery') {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) processFilesAndUpload(files); // ← КЛЮЧЕВОЕ
            };
            input.click();
          }
        });
        return;
      }
    }
    // Fallback: обычный инпут
    const input = document.getElementById('photo-upload') as HTMLInputElement;
    input?.click();
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    
    // Также удаляем соответствующий file_id
    setTelegramFiles(prev => prev.filter((_, i) => i !== index))
    
    // Удаляем соответствующий прогресс
    setUploadProgress(prev => prev.filter((_, i) => i !== index))
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
        <div className="bg-background border-b border-border px-4 py-8 pt-safe">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-3" onClick={() => setShowConfirmation(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Подтверждение заявки</h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Проверьте данные<br />перед отправкой
              </p>
            </div>
          </div>
        </div>


        <div className="px-4 py-2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Данные заявки</h2>
            <div className="space-y-3">
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
                    {formData.photos.map((photo, index) => {
                      const progress = uploadProgress[index];
                      return (
                        <div key={index} className="relative">
                        <Image
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover w-20 h-20"
                        />
                          
                          {/* Индикатор прогресса */}
                          {progress && progress.status !== 'completed' && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <div className="text-white text-xs text-center">
                                {progress.status === 'compressing' && (
                                  <div>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                                    <div>Сжатие...</div>
                                  </div>
                                )}
                                {progress.status === 'uploading' && (
                                  <div>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                                    <div>Загрузка...</div>
                                  </div>
                                )}
                                {progress.status === 'error' && (
                                  <div className="text-red-300">
                                    <div>❌</div>
                                    <div className="text-xs">Ошибка</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pb-6">
            <Button 
              variant="outline" 
              className={`flex-1 h-12 text-sm ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setShowConfirmation(false)}
              disabled={isUploading}
            >
              Править
            </Button>
            <Button 
              className={`flex-1 h-12 text-sm ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleSubmitRequest}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Загрузка...
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Отправить заявку
                </>
              )}
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
      <div className="bg-background border-b border-border px-4 py-8 pt-safe">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Новая заявка</h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Шаг {currentStep}/6
            </p>
          </div>
        </div>
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

      <div className="px-4 py-2">
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-primary">{currentStep}</span>
            <span className="text-xs text-muted-foreground">из 6</span>
          </div>
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {currentStep === 6 
              ? "Нажмите \"Завершить\",<br />чтобы пропустить"
              : currentStep === 5
              ? "Укажите необходимые<br />материалы списком"
              : `Например, "${currentStepData.placeholder}"`
            }
          </p>
        </div>
        <div>
          {currentStep === 4 ? (
            <div className="space-y-4 min-h-[150px] flex flex-col">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">Выберите дату</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-12"
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
              <div className="flex-1">
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
            </div>
            ) : currentStep === 5 ? (
              <div className="min-h-[150px] flex flex-col">
              <Textarea 
                  placeholder={currentStepData.placeholder}
                  value={formData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-32"
              />
            </div>
            ) : currentStep === 6 ? (
              <div className="min-h-[150px]">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {formData.photos.length === 0 ? (
                    // Показываем приветствие только если нет фото
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Добавьте фотографии</p>
                    </div>
                  ) : (
                    // Показываем фото в сетке
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {formData.photos.map((photo, index) => {
                        const progress = uploadProgress[index];
                        return (
                          <div key={index} className="relative">
                            <Image
                              src={photo}
                              alt={`Фото ${index + 1}`}
                              width={100}
                              height={100}
                              className="rounded-lg object-cover w-24 h-24"
                            />
                            
                            {/* Индикатор прогресса */}
                            {progress && progress.status !== 'completed' && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="text-white text-xs text-center">
                                  {progress.status === 'compressing' && (
                                    <div>
                                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                                      <div>Сжатие...</div>
                                    </div>
                                  )}
                                  {progress.status === 'uploading' && (
                                    <div>
                                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                                      <div>Загрузка...</div>
                                    </div>
                                  )}
                                  {progress.status === 'error' && (
                                    <div className="text-red-300">
                                      <div>❌</div>
                                      <div className="text-xs">Ошибка</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Кнопка загрузки всегда видна */}
                  <div className="text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button 
                      onClick={handleTelegramPhotoUpload}
                      disabled={isUploading}
                      className={isUploading ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Загрузка...
                        </div>
                      ) : (
                        formData.photos.length === 0 ? "Выбрать фото" : "Добавить еще фото"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[150px] flex flex-col">
                <Input
                  placeholder={currentStepData.placeholder}
                  value={formData[currentStepData.field as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
              </div>
            )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pb-6">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              className={`flex-1 h-12 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={prevStep}
              disabled={isUploading}
            >
              Назад
            </Button>
          )}
          <Button 
            className={`flex-1 h-12 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={nextStep}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Загрузка...
              </div>
            ) : (
              currentStep === 6 ? "Завершить" : "Далее"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
