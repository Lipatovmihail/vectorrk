# 🚀 Быстрый деплой на Vercel

## 1. Подготовка
✅ Проект готов к деплою
✅ Сборка проходит успешно
✅ Все зависимости установлены

## 2. Деплой через Vercel CLI

```bash
# Установка Vercel CLI
npm i -g vercel

# Переход в папку проекта
cd vector

# Логин в Vercel
vercel login

# Деплой
vercel
```

## 3. Настройка переменных окружения

В настройках Vercel добавьте:
```
TELEGRAM_BOT_TOKEN=7740316054:AAF9iYAOn8KJRpHGpapnop6PH47laytn92A
TELEGRAM_CHAT_ID=237551991
```

## 4. Проверка

После деплоя проверьте:
- ✅ Главная страница: `https://your-domain.vercel.app/`
- ✅ Страница заявки: `https://your-domain.vercel.app/request`
- ✅ API роут: `https://your-domain.vercel.app/api/telegram-upload`

## 5. Обновление Telegram WebApp

В настройках бота обновите URL:
```
https://your-domain.vercel.app/request
```

## 🎉 Готово!

Проект готов к деплою на Vercel!
