import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { file, fileName, orderNumber, objectName } = await request.json();
    
    console.log('📸 Получен запрос на загрузку фото:', { fileName, orderNumber, objectName });
    
    if (!file) {
      console.error('❌ Файл не предоставлен');
      return NextResponse.json({ success: false, error: 'Файл не предоставлен' }, { status: 400 });
    }

    // Извлекаем base64 данные (убираем data:image/jpeg;base64,)
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log('📸 Файл конвертирован в buffer, размер:', buffer.length);

    // Telegram Bot API endpoint для отправки фото
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    
    console.log('🔧 Переменные окружения:', { 
      hasToken: !!telegramBotToken, 
      hasChatId: !!telegramChatId,
      chatId: telegramChatId 
    });
    
    if (!telegramBotToken || !telegramChatId) {
      console.error('❌ Отсутствуют переменные окружения для Telegram Bot API');
      return NextResponse.json({ 
        success: false, 
        error: 'Конфигурация Telegram Bot API не настроена' 
      }, { status: 500 });
    }

    // Создаем FormData для отправки в Telegram
    const formData = new FormData();
    formData.append('photo', new Blob([buffer]), fileName);
    formData.append('chat_id', telegramChatId);
    formData.append('caption', `📋 Заявка: ${orderNumber}\n🏢 Объект: ${objectName}\n📁 Файл: ${fileName}`);

    // Отправляем в Telegram Bot API
    console.log('📤 Отправляем файл в Telegram Bot API...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    console.log('📦 Статус ответа от Telegram:', telegramResponse.status);
    const telegramResult = await telegramResponse.json();
    console.log('📦 Ответ от Telegram:', telegramResult);

    if (!telegramResult.ok) {
      console.error('❌ Ошибка Telegram Bot API:', telegramResult);
      return NextResponse.json({ 
        success: false, 
        error: `Ошибка Telegram API: ${telegramResult.description}` 
      }, { status: 500 });
    }

    // Извлекаем file_id из ответа Telegram
    const fileId = telegramResult.result.photo[telegramResult.result.photo.length - 1].file_id;
    
    console.log('✅ Файл загружен в Telegram:', {
      fileName,
      fileId,
      orderNumber,
      objectName
    });

    return NextResponse.json({ 
      success: true, 
      file_id: fileId,
      fileName,
      message: 'Файл успешно загружен в Telegram'
    });

  } catch (error) {
    console.error('❌ Ошибка при загрузке файла в Telegram:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}
