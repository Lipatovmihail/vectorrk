import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { photos, orderNumber, objectName } = await request.json();

    if (!photos?.length) {
      return NextResponse.json({ success: true, files: [] });
    }

    // Настройки Google Drive
    const FOLDER_ID = '1zmYccS5V0MsUoXauVLYhviYt3v1dkPey'; // ID папки из URL
    const SERVICE_ACCOUNT_EMAIL = 'parser@liquid-agility-329915.iam.gserviceaccount.com';
    
    // Получаем приватный ключ из переменных окружения
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'Google Drive credentials not configured' },
        { status: 500 }
      );
    }

    // Настройка аутентификации
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const uploadedFiles: Array<{
      index: number;
      fileId: string;
      fileName: string;
      fileUrl: string;
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

      const ext = (mime.split('/')[1] || 'jpg').toLowerCase();
      const fileName = `Заявка_${orderNumber || 'Без_номера'}_Фото_${i + 1}_${new Date().toISOString().split('T')[0]}.${ext}`;

      try {
        // Загружаем файл в Google Drive
        const response = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [FOLDER_ID],
          },
          media: {
            mimeType: mime,
            body: buffer,
          },
          fields: 'id,name,webViewLink',
        });

        if (response.data.id) {
          uploadedFiles.push({
            index: i + 1,
            fileId: response.data.id,
            fileName: response.data.name || fileName,
            fileUrl: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
            caption: `Фото ${i + 1} для заявки ${orderNumber || 'Без номера'} - ${objectName || 'Без объекта'}`
          });
          
          console.log(`✅ Фото ${i + 1} загружено в Google Drive:`, response.data.id);
        }
      } catch (error) {
        console.error(`❌ Ошибка загрузки фото ${i + 1} в Google Drive:`, error);
        return NextResponse.json(
          { success: false, error: `Failed to upload photo ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Загружено ${uploadedFiles.length} из ${photos.length} фото в Google Drive`,
    });
  } catch (err) {
    console.error('❌ upload-to-drive error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
