# 📱 HOUSEHOLD App & Frontend

Клиентская часть сервиса HOUSEHOLD: современное Svelte 5 PWA-приложение и Android-клиент с поддержкой Push-уведомлений Firebase (FCM).

---

## ⚡ Быстрый старт для нового разработчика

### 1. Запуск веб-фронтенда (Svelte 5 / Vite)

```bash
cd frontend

# 1. Скопировать файл окружения
cp .env.example .env

# 2. Установить зависимости Node.js
npm install

# 3. Запустить локальный сервер разработки
npm run dev
```

Фронтенд запустится по адресу: **http://localhost:5173**  
*(При необходимости в `frontend/src/api/client.js` можно скорректировать адрес бэкенда, по умолчанию `/api`)*.

---

## 🔐 Секретные файлы и конфигурации (`.example`)

| Файл с примером | Рабочий файл | Назначение | Где взять |
| :--- | :--- | :--- | :--- |
| [`frontend/.env.example`](file://frontend/.env.example) | `frontend/.env` | Web Client ID для авторизации через Google | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) -> OAuth 2.0 Client IDs (тип: Web application). |
| [`app/google-services.json.example`](file://app/google-services.json.example) | `app/google-services.json` | Конфигурация Firebase для Android-приложения | В [Firebase Console](https://console.firebase.google.com/) -> *Project Settings* -> *General* -> Скачать `google-services.json`. |

---

## 📦 Сборка фронтенда

### Для раздачи через FastAPI бэкенд (PWA):
```bash
cd frontend
npm run build:pwa
```
Собранные файлы попадут в папку `dist/`.  
Если оба репозитория находятся рядом, из папки бэкенда можно просто выполнить:
```bash
make pwa-build
```
Эта команда соберёт PWA и автоматически скопирует файлы в `HOUSEHOLD/static/`.

### Для сборки Android APK:
```bash
cd frontend
npm run build
```
Скомпилированные ассеты автоматически запишутся в `app/src/main/assets/`.

---

## 🤖 Сборка и запуск Android-приложения

1. Убедитесь, что положили правильный файл `app/google-services.json`.
2. Выполните сборку ассетов фронтенда:
   ```bash
   cd frontend && npm run build && cd ..
   ```
3. Соберите и установите APK на подключенное устройство:
   ```bash
   # Сборка debug-версии APK:
   ./gradlew assembleDebug

   # Или сразу сборка и установка на подключенный Android-телефон/эмулятор:
   ./gradlew installDebug
   ```
   Готовый APK файл будет находиться по пути:
   `app/build/outputs/apk/debug/app-debug.apk`

---

## 🔑 Возможности экрана авторизации

На экране входа доступны:
* **Вход по логину и паролю** (переключение на вкладку «Войти»).
* **Регистрация нового аккаунта** (переключение на вкладку «Регистрация» — логин, имя, пароль от 6 символов).
* **Быстрый вход через Google** (официальная кнопка Google Identity Services и подсказка One Tap).
* **Быстрый вход для разработчика** (кнопка debug внизу для мгновенного входа без пароля).