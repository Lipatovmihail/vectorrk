# Деплой на Vercel

## Подготовка проекта

Проект уже подготовлен для деплоя на Vercel:

### ✅ Конфигурация
- `vercel.json` - настроен для Next.js
- `package.json` - убран флаг --turbopack из build команды
- `.vercelignore` - исключены ненужные файлы

### ✅ Сборка
- Проект успешно собирается: `npm run build`
- Все ошибки ESLint исправлены
- TypeScript типы корректны

## Деплой на Vercel

### Вариант 1: Через Vercel CLI
```bash
# Установить Vercel CLI
npm i -g vercel

# Войти в аккаунт
vercel login

# Деплой
vercel

# Продакшн деплой
vercel --prod
```

### Вариант 2: Через GitHub
1. Подключить репозиторий к Vercel
2. Vercel автоматически определит Next.js
3. Настройки уже готовы в `vercel.json`

## Настройки окружения

**Для загрузки фото в Google Drive требуется:**

В Vercel Dashboard → Settings → Environment Variables добавить:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Как получить:**
1. **Service Account**: `parser@liquid-agility-329915.iam.gserviceaccount.com`
2. **Private Key**: Скачайте JSON ключ из Google Cloud Console
3. **Папка**: `https://drive.google.com/drive/folders/1zmYccS5V0MsUoXauVLYhviYt3v1dkPey`

**Без этих переменных:**
- ✅ Приложение работает
- ✅ Отправка заявок работает  
- ❌ Фото не загружаются в Google Drive (остаются blob URLs)

## Проверка деплоя

После деплоя проверить:
- ✅ Главная страница загружается
- ✅ Страница заявки работает
- ✅ Календарь функционирует
- ✅ Загрузка фото работает
- ✅ Все шаги формы работают
- ✅ Тематические фотографии загружаются
- ✅ Stories с фотографиями отображаются корректно

## Структура проекта

```
vector/
├── src/app/
│   ├── page.tsx          # Главная страница
│   ├── request/page.tsx  # Форма заявки
│   └── layout.tsx        # Общий layout
├── src/components/ui/    # UI компоненты
├── public/               # Статические файлы
├── vercel.json          # Конфигурация Vercel
└── package.json         # Зависимости
```

## Особенности

- ✅ Next.js 15.5.4 с TypeScript
- ✅ Tailwind CSS + shadcn/ui компоненты
- ✅ Telegram WebApp интеграция
- ✅ Нативная загрузка фото через Telegram
- ✅ Отправка данных через Telegram WebApp
- ✅ Адаптивный дизайн для мобильных устройств
- ✅ Тематические фотографии для строительной компании
- ✅ Пошаговая форма заявки с date picker
- ✅ Прозрачная закрепленная шапка
- ✅ Упрощенная архитектура (без Google Drive)
- ✅ Никаких переменных окружения не требуется