# 🔐 Руководство по правам пользователей

## 📋 Обзор системы прав

В приложении реализована система прав пользователей на основе Telegram User ID. Это позволяет показывать/скрывать различные элементы интерфейса в зависимости от роли пользователя.

## 🎯 Типы прав

### **1. canCreateRequests** (Все пользователи)
- ✅ **Право:** Создавать новые заявки
- 👥 **Кто:** Все пользователи по умолчанию
- 🎯 **Использование:** Доступ к форме создания заявки

### **2. canEditRequests** (Редакторы)
- ✅ **Право:** Редактировать заявки
- 👥 **Кто:** Пользователи из списка `editorIds`
- 🎯 **Использование:** Кнопка "Править" на странице подтверждения

### **3. canViewAllRequests** (Просмотрщики)
- ✅ **Право:** Просматривать все заявки
- 👥 **Кто:** Пользователи из списка `viewerIds`
- 🎯 **Использование:** Доступ к списку всех заявок

### **4. isAdmin** (Администраторы)
- ✅ **Право:** Полный доступ ко всем функциям
- 👥 **Кто:** Пользователи из списка `adminIds`
- 🎯 **Использование:** Все функции + административные возможности

## 🔧 Настройка прав

### **В коде (src/app/request/page.tsx):**

```javascript
const checkUserPermissions = (telegramId: number) => {
  // Список админов
  const adminIds = [237551991, 123456789];
  
  // Список редакторов
  const editorIds = [237551991, 987654321];
  
  // Список просмотрщиков
  const viewerIds = [237551991, 555666777];
  
  const permissions = {
    canCreateRequests: true, // Все могут создавать
    canEditRequests: editorIds.includes(telegramId),
    canViewAllRequests: viewerIds.includes(telegramId),
    isAdmin: adminIds.includes(telegramId)
  };
  
  setUserPermissions(permissions);
}
```

### **В переменных окружения (.env.local):**

```env
# Списки ID пользователей (через запятую)
ADMIN_IDS=237551991,123456789
EDITOR_IDS=237551991,987654321
VIEWER_IDS=237551991,555666777
```

## 💡 Примеры использования

### **1. Условное отображение кнопок:**

```jsx
{userPermissions.canEditRequests && (
  <Button>Править</Button>
)}
```

### **2. Условное отображение разделов:**

```jsx
{userPermissions.isAdmin && (
  <div className="admin-panel">
    <h3>Административная панель</h3>
    {/* Админ функции */}
  </div>
)}
```

### **3. Условное отображение навигации:**

```jsx
{userPermissions.canViewAllRequests && (
  <Link href="/all-requests">
    <Button>Все заявки</Button>
  </Link>
)}
```

### **4. Условные стили:**

```jsx
<div className={`request-card ${userPermissions.isAdmin ? 'admin-highlight' : ''}`}>
  {/* Содержимое */}
</div>
```

## 🚀 Расширенные возможности

### **1. Динамические права из API:**

```javascript
const checkUserPermissions = async (telegramId: number) => {
  try {
    const response = await fetch(`/api/user-permissions/${telegramId}`);
    const permissions = await response.json();
    setUserPermissions(permissions);
  } catch (error) {
    // Fallback к статическим правам
    setDefaultPermissions(telegramId);
  }
}
```

### **2. Права на основе ролей:**

```javascript
const getRolePermissions = (role: string) => {
  const rolePermissions = {
    'admin': { canEditRequests: true, canViewAllRequests: true, isAdmin: true },
    'editor': { canEditRequests: true, canViewAllRequests: false, isAdmin: false },
    'viewer': { canEditRequests: false, canViewAllRequests: true, isAdmin: false },
    'user': { canEditRequests: false, canViewAllRequests: false, isAdmin: false }
  };
  
  return rolePermissions[role] || rolePermissions['user'];
}
```

### **3. Временные права:**

```javascript
const checkTemporaryPermissions = (telegramId: number) => {
  const now = new Date();
  const temporaryAccess = {
    237551991: { until: new Date('2024-12-31'), permissions: { isAdmin: true } }
  };
  
  if (temporaryAccess[telegramId] && now < temporaryAccess[telegramId].until) {
    return temporaryAccess[telegramId].permissions;
  }
  
  return {};
}
```

## 🔍 Отладка прав

### **В консоли браузера:**

```javascript
// Проверить текущие права
console.log('Текущие права:', userPermissions);

// Проверить Telegram ID
console.log('Telegram ID:', window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
```

### **В логах приложения:**

```
🔐 Права пользователя: {
  canCreateRequests: true,
  canEditRequests: false,
  canViewAllRequests: true,
  isAdmin: false
}
```

## 📱 Безопасность

### **Важные моменты:**

1. **Права проверяются на клиенте** - для критичных операций нужна проверка на сервере
2. **ID пользователей** можно получить из Telegram WebApp
3. **Списки прав** лучше хранить в переменных окружения
4. **Критичные операции** должны проверяться на backend

### **Рекомендации:**

- ✅ Используйте права для UX (показ/скрытие элементов)
- ❌ Не полагайтесь только на клиентские права для безопасности
- ✅ Дублируйте проверки на сервере для критичных операций
- ✅ Логируйте действия пользователей с правами

## 🎯 Готовые примеры

### **Скрыть кнопку "Править" для обычных пользователей:**
```jsx
{userPermissions.canEditRequests && (
  <Button>Править</Button>
)}
```

### **Показать админ-панель только админам:**
```jsx
{userPermissions.isAdmin && (
  <AdminPanel />
)}
```

### **Ограничить доступ к определенным шагам:**
```jsx
{userPermissions.canCreateRequests && currentStep <= 6 && (
  <StepContent />
)}
```
