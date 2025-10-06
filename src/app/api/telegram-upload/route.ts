import { NextResponse } from 'next/server';

export const runtime = 'nodejs';        // ← важно
export const dynamic = 'force-dynamic'; // чтобы не кешило ответы

export async function POST(request: Request) {
  try {
    const { file, fileName, orderNumber, objectName } = await request.json();

    if (!file) {
      return NextResponse.json({ success: false, error: 'Файл не предоставлен' }, { status: 400 });
    }

    // извлекаем mime и payload
    const m = String(file).match(/^data:(.+);base64,(.+)$/);
    if (!m) {
      return NextResponse.json({ success: false, error: 'Некорректный формат файла (base64)' }, { status: 400 });
    }
    const mime = m[1];
    const raw  = m[2];
    const buffer = Buffer.from(raw, 'base64');

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId   = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!telegramBotToken || !telegramChatId) {
      return NextResponse.json({ success: false, error: 'Конфигурация Telegram Bot API не настроена' }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('chat_id', telegramChatId);
    formData.append('caption', `📋 Заявка: ${orderNumber}\n🏢 Объект: ${objectName}\n📁 Файл: ${fileName}`);
    formData.append('photo', new Blob([buffer], { type: mime }), fileName); // ← type важен

    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    const telegramResult = await telegramResponse.json();
    if (!telegramResponse.ok || !telegramResult?.ok) {
      return NextResponse.json(
        { success: false, error: telegramResult?.description || 'Ошибка Telegram API', tg: telegramResult },
        { status: 400 }
      );
    }

    const sizes = telegramResult.result.photo || [];
    const fileId = sizes[sizes.length - 1]?.file_id;

    return NextResponse.json({ success: true, file_id: fileId, fileName });

  } catch (error) {
    console.error('upload telegram error:', error);
    return NextResponse.json({ success: false, error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
