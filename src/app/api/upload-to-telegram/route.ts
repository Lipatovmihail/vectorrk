import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { photos, orderNumber, objectName } = await request.json();
    
    if (!photos || photos.length === 0) {
      return NextResponse.json({ success: true, files: [] });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID; // ID чата для сохранения файлов
    
    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram bot credentials not configured' 
      }, { status: 500 });
    }

    const uploadedFiles = [];

    for (let i = 0; i < photos.length; i++) {
      const base64Data = photos[i];
      
      // Извлекаем base64 строку
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.warn(`⚠️ Некорректный формат base64 для фото ${i + 1}`);
        continue;
      }
      
      const mimeType = matches[1];
      const base64Image = matches[2];
      const buffer = Buffer.from(base64Image, 'base64');
      
      // Создаем FormData для отправки в Telegram
      const formData = new FormData();
      const blob = new Blob([buffer], { type: mimeType });
      const fileName = `photo_${i + 1}_${orderNumber || 'request'}_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
      
      formData.append('photo', blob, fileName);
      formData.append('chat_id', CHAT_ID);
      formData.append('caption', `Фото ${i + 1} для заявки ${orderNumber || 'Без номера'} - ${objectName || 'Без объекта'}`);

      try {
        // Отправляем файл в Telegram
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.ok) {
          const fileId = result.result.photo[result.result.photo.length - 1].file_id; // Берем самое большое разрешение
          const fileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
          
          uploadedFiles.push({
            index: i + 1,
            fileId: fileId,
            fileUrl: fileUrl,
            messageId: result.result.message_id,
            caption: `Фото ${i + 1} для заявки ${orderNumber || 'Без номера'}`
          });
          
          console.log(`✅ Фото ${i + 1} загружено в Telegram:`, fileId);
        } else {
          console.error(`❌ Ошибка загрузки фото ${i + 1}:`, result);
        }
      } catch (error) {
        console.error(`❌ Ошибка отправки фото ${i + 1} в Telegram:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Загружено ${uploadedFiles.length} из ${photos.length} фото`
    });

  } catch (error) {
    console.error('❌ Ошибка в API route upload-to-telegram:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
