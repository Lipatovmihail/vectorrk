import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📤 API Route: Получены данные для отправки:', body)
    
    // Отправляем данные на n8n webhook через сервер
    const response = await fetch('https://n8nunit.miaai.ru/webhook/f760ae2e-d95f-4f48-9134-c60aa408372b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(body.telegram_id && { 'X-Telegram-ID': body.telegram_id }),
        ...(body.initData && { 'X-Telegram-InitData': body.initData }),
      },
      body: JSON.stringify(body)
    })

    console.log('📦 API Route: Ответ от n8n:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Route: Ошибка сервера:', errorText)
      return NextResponse.json(
        { success: false, error: `HTTP error! status: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('📦 API Route: Сырой ответ от n8n:', data)
    
    // n8n возвращает массив, берем первый элемент
    let actualData = data
    if (Array.isArray(data) && data.length > 0) {
      actualData = data[0]
    }

    return NextResponse.json({
      success: true,
      data: actualData
    })

  } catch (error) {
    console.error('❌ API Route: Ошибка при отправке:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
