# 🚀 Деплой на Vercel

## 📋 Подготовка к деплою

### 1. Переменные окружения
В настройках Vercel добавьте следующие переменные окружения:

```env
TELEGRAM_BOT_TOKEN=7740316054:AAF9iYAOn8KJRpHGpapnop6PH47laytn92A
TELEGRAM_CHAT_ID=-1003083346855
```

**Важно:** Эти переменные обязательны для работы загрузки фото в Telegram!

### 2. Настройки Vercel
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 🔧 Команды для деплоя

### Локальная сборка (тест)
```bash
npm run build
npm run start
```

### Деплой через Vercel CLI
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel

# Продакшн деплой
vercel --prod
```

## 📁 Структура проекта
```
vector/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── telegram-upload/
│   │   │       └── route.ts
│   │   ├── request/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── components/
├── package.json
├── vercel.json
└── .env.local (локально)
```

## ✅ Проверка после деплоя

1. **Проверьте API роут:**
   - `https://your-domain.vercel.app/api/telegram-upload`
   - Должен возвращать 405 Method Not Allowed для GET запросов

2. **Проверьте страницу заявки:**
   - `https://your-domain.vercel.app/request`
   - Должна загружаться без ошибок

3. **Проверьте загрузку фото:**
   - Добавьте фото на 6 шаге
   - Проверьте отладочную информацию с file_id
   - Проверьте отправку заявки

## 🔍 Отладка

### Логи Vercel
```bash
vercel logs
```

### Локальная отладка
```bash
# Проверка переменных окружения
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# Тест API роута
curl -X POST http://localhost:3000/api/telegram-upload \
  -H "Content-Type: application/json" \
  -d '{"file":"data:image/jpeg;base64,/9j/4AAQ...","fileName":"test.jpg"}'
```

## 🚨 Важные моменты

1. **Переменные окружения** должны быть добавлены в настройках Vercel
2. **TELEGRAM_BOT_TOKEN** должен быть действительным
3. **TELEGRAM_CHAT_ID** должен существовать
4. **API роут** должен быть доступен по HTTPS
5. **CORS** настроен для Telegram WebApp

## 📱 Telegram WebApp

После деплоя обновите URL WebApp в настройках бота:
```
https://your-domain.vercel.app/request
```

## 🔄 Обновление

Для обновления проекта:
```bash
git add .
git commit -m "Update project"
git push
# Vercel автоматически пересоберет проект
```