import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { photos, orderNumber, objectName } = await request.json();

    if (!photos?.length) {
      return NextResponse.json({ success: true, files: [] });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json(
        { success: false, error: 'Telegram bot credentials not configured' },
        { status: 500 }
      );
    }

    const uploadedFiles: Array<{
      index: number;
      fileId: string;
      messageId: number;
      caption: string;
    }> = [];

    for (let i = 0; i < photos.length; i++) {
      const base64 = String(photos[i]);
      const m = base64.match(/^data:(.+);base64,(.+)$/);
      if (!m) {
        console.warn(`⚠️ base64 не распознан для фото ${i + 1}`);
        continue;
      }

      const mime = m[1];
      const raw = m[2];
      const buffer = Buffer.from(raw, 'base64');

      // Ключевой момент — нативный Blob + нативный FormData
      const blob = new Blob([buffer], { type: mime });
      const ext = (mime.split('/')[1] || 'jpg').toLowerCase();
      const fileName = `photo_${i + 1}_${orderNumber || 'request'}_${Date.now()}.${ext}`;

      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('caption', `Фото ${i + 1} для заявки ${orderNumber || 'Без номера'} - ${objectName || 'Без объекта'}`);
      form.append('photo', blob, fileName);

      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: form, // заголовки выставятся автоматически
      });

      const result = await tgRes.json();

      if (!tgRes.ok || !result?.ok) {
        // Пробрасываем ошибку наружу, чтобы на фронте это было видно
        return NextResponse.json(
          { success: false, error: result?.description || 'Telegram upload failed', tg: result },
          { status: 400 }
        );
      }

      const sizes = result.result.photo || [];
      const fileId = sizes[sizes.length - 1]?.file_id;
      uploadedFiles.push({
        index: i + 1,
        fileId,
        messageId: result.result.message_id,
        caption: `Фото ${i + 1} для заявки ${orderNumber || 'Без номера'}`
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Загружено ${uploadedFiles.length} из ${photos.length} фото`,
    });
  } catch (err) {
    console.error('❌ upload-to-telegram error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
