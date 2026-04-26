# LUME Quiz — Тест на знание admin.lume.uz

Платформа тестирования по системе администрирования **admin.lume.uz** на двух языках (русский и узбекский). Построена на **Next.js 14 (App Router)**, **Prisma + Neon Postgres**, **TailwindCSS**, **JWT-сессии (jose)**.

## Возможности

- **Регистрация / вход по e-mail и имени** для обычных пользователей
- **Отдельный вход для администратора** с переключателем на странице `/login`
- **200 уникальных вопросов** о admin.lume.uz, к каждому — реальный скриншот системы
- Каждое прохождение — **20 случайных вопросов** из 200 (повторов нет)
- **Только одна попытка с одного аккаунта** (на уровне БД: `Attempt.userId @unique`)
- **Real-time счётчики** правильных и неправильных ответов прямо во время теста
- **Админ-панель** (`/admin`):
  - поиск по имени или e-mail
  - таблица всех пользователей с баллами и статусом теста
  - агрегаты: количество пользователей, количество завершённых попыток, средний балл
- Полная **локализация RU / UZ**, переключатель в шапке
- UI вдохновлён прототипом и реальной палитрой LUME (тёмно-синий + белый)

## Запуск локально

```bash
npm install
cp .env.example .env       # затем заполните DATABASE_URL и AUTH_SECRET
npx prisma db push
npm run dev
```

Откройте http://localhost:3000

### Переменные окружения

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Строка подключения Neon Postgres (pooled) |
| `DIRECT_URL` | Строка подключения Neon (non-pooled, для миграций) |
| `AUTH_SECRET` | Длинная случайная строка для подписи JWT (`openssl rand -base64 48`) |
| `ADMIN_EMAIL` | E-mail администратора (по умолчанию `admin@lumequiz.local`) |
| `ADMIN_PASSWORD` | Пароль администратора (по умолчанию `admin123`) |

## Деплой на Vercel + Neon

1. Создайте базу в Neon, скопируйте **pooled connection string** в `DATABASE_URL` и **direct connection** в `DIRECT_URL`.
2. Подключите репозиторий к Vercel.
3. В Vercel → *Project Settings → Environment Variables* добавьте:
   - `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
4. Build command: `npm run build` (Prisma client генерируется автоматически).
5. После первого деплоя один раз выполните `npx prisma db push` (или из CI), чтобы создать таблицы.

## Структура

```
app/
  page.tsx                Лендинг
  login/                  Вход (с переключателем «Админ»)
  register/               Регистрация
  test/                   Прохождение теста
  admin/                  Админ-панель
  api/auth/{login,logout,register}/route.ts
  api/test/{start,answer,finish,state}/route.ts
  api/admin/users/route.ts
components/
  Navbar.tsx              Шапка + переключатель языка
  TestRunner.tsx          Реальная логика теста (счётчики, реал-тайм)
  AdminPanel.tsx          Поиск, таблица, KPI
lib/
  db.ts                   Prisma client (singleton)
  auth.ts                 JWT-сессии в httpOnly cookie
  i18n.ts / i18n-server.ts Словари RU/UZ
  questions.ts            200 вопросов с привязкой к скриншотам
prisma/schema.prisma      Модели User, Attempt, Answer
public/screenshots/       Реальные скриншоты admin.lume.uz
```

## Источник вопросов

Все 200 вопросов составлены на основе реальных скриншотов admin.lume.uz, снятых с использованием авторизации `point@indev.uz`. Скриншоты охватывают все основные разделы (Главная, Складские операции, Справочник, Финансовые операции, Отчёты, Настройки, Кабинет) и большинство вложенных страниц (Товары, Клиенты, Отчёт о продаже и т.д.).

## Single-attempt rule

Уникальность попытки гарантируется на уровне БД: модель `Attempt` имеет `@unique` на `userId`. Попытка стартовать второй раз при наличии завершённой попытки возвращает `409 Conflict`. Незавершённую попытку можно продолжить — состояние и сохранённые ответы лежат в БД.
