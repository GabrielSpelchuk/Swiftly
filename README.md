# Swiftly

Платформа дропшипінгу з чотирма ролями: постачальники виставляють товари,
дропшипери їх перепродають за гуртовими цінами, звичайні клієнти купують
у роздріб, адмін керує користувачами та заявками.

---

## Технології

| Частина | Стек |
|---|---|
| `backend-nest` | NestJS 11 · TypeORM · PostgreSQL · JWT (access + refresh) · class-validator · helmet · throttler |
| `frontend` | React 18 · Redux Toolkit · React Router 6 · Axios · Create React App |
| `backend` | Старий бекенд на Node + Express + Sequelize. Замінений на `backend-nest`, залишений для історії |

---

## Можливості

### Автентифікація
- Реєстрація з вибором ролі (`customer` / `supplier` / `dropshipper`), `admin` не доступний для реєстрації
- Підтвердження пошти за токеном
- Вхід: access-токен у тілі відповіді (15 хв), refresh-токен у httpOnly-cookie (30 днів)
- До 5 паралельних сесій на користувача, старі автоматично видаляються
- Скидання пароля листом
- Паролі зберігаються як bcrypt-хеші, поле `password` має `select: false` — випадково не віддається в JSON

### Каталог
- Публічний список з фільтрами за категорією, ціною, пошуком і пагінацією
- **Дві ціни**: гуртова та роздрібна. Гуртова видно лише дропшиперам, постачальникам і адмінам — приховується на рівні сервісу, а не на рівні фронтенду
- Категорії з унікальними `name` та `slug`
- М'яке видалення товарів (`is_active = false`), позиції з кошиків прибираються

### Кошик і замовлення
- Один кошик на користувача (обмеження `unique` у базі)
- Оформлення розбиває товари на окремі замовлення за постачальниками
- Ціна фіксується в `order_items` на момент купівлі — зміна ціни товару не переписує минулі замовлення
- Списання складу атомарне (`UPDATE ... WHERE stock >= quantity`), тому два паралельні замовлення не можуть продати той самий товар двічі
- Статуси: `new` → `processing` → `shipped` → `delivered`, плюс `cancelled`
- Джерело замовлення визначає сервер за роллю (`b2c` / `b2b`), клієнт підставити не може

### Ролі
- **customer** — каталог, кошик, власні замовлення
- **supplier** — CRUD своїх товарів, зміна статусів замовлень до себе, аналітика
- **dropshipper** — каталог із гуртовими цінами, баланс, B2B-замовлення
- **admin** — користувачі, блокування, рев'ю заявок дропшиперів, загальна аналітика

Роль береться з токена, а не з тіла запиту — підмінити її з клієнта неможливо.

### Адмінка
- Список користувачів, блокування / розблокування, видалення
- Заявки дропшиперів на розгляд: approve або reject
- Аналітика, що залежить від ролі запитувача:
  - `supplier` — замовлення, виручка, товари за статусами, топ-товари
  - `dropshipper` — замовлення, прибуток, баланс
  - `admin` — користувачі, товари, замовлення, виручка, прибуток, розподіл за ролями

---

## Архітектура бекенду

```
src/
├── main.ts           bootstrap, CORS, helmet, Swagger, pipes
├── app.module.ts     кореневий модуль, TypeORM, глобальні guard-и
├── data-source.ts    підключення для CLI міграцій
├── seed.ts           тестові дані
├── migrations/       міграції TypeORM
│
├── common/           перевикористовуване
│   ├── decorators/   @Public, @Roles, @CurrentUser
│   ├── guards/       JwtAuthGuard, RolesGuard
│   └── filters/      єдиний формат помилок
│
├── auth/             вхід, refresh, реєстрація, guard-и
├── users/            профіль
├── tokens/           refresh-токени
├── mail/             SMTP
├── categories/
├── products/
├── carts/
├── orders/           транзакції, прибуток, склад
├── order-items/      лише entity
├── admin/            користувачі, рев'ю заявок
├── analytics/        статистика за ролями
├── health/           health-check
└── utils/            Roles, ORDER_STATUS, ORDER_SOURCE
```

`JwtAuthGuard` під'єднаний глобально, тому маршрут за замовчуванням закритий.
Відкритий його робить декоратор `@Public()`. Роль перевіряє `RolesGuard` через `@Roles(...)`.

---

## База даних

```
users ──────┬─< products ──< order_items >── orders >── users (placed_by)
            │     │                │
            │     └─ cart_items >─┘
            └─< carts >── cart_items
```

| Таблиця | Що зберігає |
|---|---|
| `users` | Клієнти, постачальники, дропшипери, адміни. Пароль — bcrypt, `select: false` |
| `products` | Товари, гуртова й роздрібна ціни, залишок, м'яке видалення через `is_active` |
| `categories` | Категорії, `name` та `slug` унікальні |
| `orders` | Замовлення, суми, прибуток, статус. Джерело правди для історії |
| `order_items` | Позиції замовлення з цінами **на момент купівлі** |
| `carts` / `cart_items` | Кошики. Один на користувача (`unique`) |
| `tokens` | Refresh-токени. Підтримується до 5 сесій на користувача |

Схема керується **міграціями**, а не автоматичною синхронізацією
(`DB_SYNCHRONIZE` у production завжди `false`).

---

## API

Повний опис — Swagger на `/docs` (доступний у розробці).

Усі маршрути починаються з префікса з `API_PREFIX` (`/api` у production,
без префікса локально).

### Auth

| Метод | Маршрут | Опис |
|---|---|---|
| `POST` | `/auth/register` | Реєстрація. `role` обмежено `customer` / `supplier` / `dropshipper` |
| `GET` | `/auth/activate/:token` | Підтвердження пошти |
| `POST` | `/auth/login` | Вхід. Access — у тілі, refresh — у httpOnly-cookie |
| `GET` | `/auth/refresh` | Новий access-токен за refresh-cookie |
| `POST` | `/auth/logout` | Вихід (видаляє refresh-токен) |
| `POST` | `/auth/forgot-password` | Запит листа для скидання пароля |
| `POST` | `/auth/reset-password` | Новий пароль за токеном |

### Користувачі та адмін

| Метод | Маршрут | Роль |
|---|---|---|
| `GET` `PUT` `PATCH` `DELETE` | `/users/me` | будь-який авторизований |
| `GET` | `/admin/users` | admin |
| `PATCH` | `/admin/users/:id/block` · `/unblock` | admin |
| `DELETE` | `/admin/users/:id` | admin |
| `GET` | `/admin/dropshippers/pending` | admin |
| `PATCH` | `/admin/dropshippers/:id/review` · `{ "status": "approve" \| "reject" }` | admin |
| `GET` | `/analytics/stats` | будь-який (набір залежить від ролі) |

### Каталог

| Метод | Маршрут | Опис |
|---|---|---|
| `GET` | `/products` | Публічний. Фільтри: `categoryId`, `minPrice`, `maxPrice`, `search`, `page`, `limit` |
| `GET` | `/products/:id` | Публічний |
| `GET` | `/products/my/list` | supplier — свої товари з гуртовою ціною |
| `POST` | `/products` | supplier |
| `PUT` `PATCH` `DELETE` | `/products/:id` | supplier, лише власні |

### Кошик і замовлення

| Метод | Маршрут | Опис |
|---|---|---|
| `GET` `DELETE` | `/cart` | Кошик поточного користувача |
| `POST` | `/cart/items` | Додати товар |
| `PUT` `DELETE` | `/cart/items/:id` | Змінити кількість / видалити позицію |
| `POST` | `/orders` | Оформити. Товари різних постачальників → окремі замовлення |
| `GET` | `/orders` | Свої замовлення (за роллю) |
| `GET` `DELETE` | `/orders/:id` | Деталі / скасувати (`new`) |
| `PATCH` | `/orders/:id/status` | supplier |

### Системні

| Метод | Маршрут | Опис |
|---|---|---|
| `GET` | `/health` | Перевірка живості БД |

---

## Локальний запуск

### Передумови

- Node.js **20+**
- PostgreSQL **14+**

### База даних

Встанови Postgres локально або підніми в Docker (це єдине місце, де Docker ще доречний):

```bash
docker run -d --name swiftly-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=12345 \
  -e POSTGRES_DB=Swiftly \
  -p 5432:5432 postgres:16-alpine
```

Або своя інсталяція — достатньо створити базу `Swiftly`.

### Бекенд

```bash
cd backend-nest

cp .env.example .env      # відредагувати під свою машину
npm install

npm run migration:run     # створити таблиці
npm run seed              # тестові дані + акаунти (необов'язково)
npm run start:dev
```

API — `http://localhost:3005`, Swagger — `/docs`.

> Якщо `npm run migration:run` каже, що бази немає — перевір `DB_NAME` у `.env`
> і те, що Postgres приймає з'єднання на `DB_PORT`.

### Фронтенд

```bash
cd frontend

cp .env.example .env      # REACT_APP_API_URL=http://localhost:3005
npm install
npm start
```

Застосунок — `http://localhost:3000`.

### Тестові акаунти

`npm run seed` створює чотири акаунти з паролем `password123`:

| Email | Роль | Бачить |
|---|---|---|
| `admin@swiftly.com` | admin | адмін-панель, всі користувачі, заявки, аналітика |
| `supplier@swiftly.com` | supplier | свої товари, замовлення до виконання |
| `dropshipper@swiftly.com` | dropshipper | гуртові ціни, баланс, свої замовлення |
| `customer@swiftly.com` | customer | каталог, кошик, замовлення |

---

## Змінні оточення

### Бекенд (`backend-nest/.env`)

| Змінна | За замовчуванням | Опис |
|---|---|---|
| `NODE_ENV` | `development` | У `production` Swagger вимкнено, cookie стає `secure` |
| `PORT` | `3005` | Порт HTTP-сервера |
| `API_PREFIX` | — | Префікс маршрутів. `api` → `/api/products`; порожній → `/products` |
| `CLIENT_HOST` | `http://localhost:3000` | Домен фронтенду. Кілька доменів — через кому |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Підключення до PostgreSQL |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `postgres` / `12345` / `Swiftly` | Облікові дані БД |
| `DB_SYNCHRONIZE` | `false` | Синхронізація затирає дані. У production **завжди** `false` |
| `JWT_SECRET` | — | Секрет підпису access-токенів |
| `JWT_EXPIRES_IN` | `15m` | Життя access-токена |
| `JWT_REFRESH_SECRET` | — | Секрет refresh-токенів. Має відрізнятися від `JWT_SECRET` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Життя refresh-токена |
| `SWAGGER_ENABLED` | — | `true` вмикає Swagger навіть у production (тільки за HTTPS) |
| `MAIL_HOST` та ін. | — | SMTP. Порожній `MAIL_HOST` → листи логуються, а не надсилаються |
| `APP_URL` | `http://localhost:3000` | Адреса застосунку для посилань у листах |

### Фронтенд (`frontend/.env`)

| Змінна | Опис |
|---|---|
| `REACT_APP_API_URL` | Адреса API: абсолютна (`http://localhost:3005`) або відносна (`/api`) |

> `REACT_APP_API_URL` читається **під час складання**, а не під час запуску.
> Змінив — перебудуй проєкт.

---

## Скрипти

### `backend-nest`

| Команда | Опис |
|---|---|
| `npm run start:dev` | Запуск у режимі розробки з автоперезавантаженням |
| `npm run build` | Збірка в `dist/` |
| `npm run start:prod` | Запуск зібраного `dist/main.js` |
| `npm run deploy` | `migration:run:prod` + `start:prod` |
| `npm run migration:run` | Застосувати міграції (через `ts-node`) |
| `npm run migration:revert` | Відкотити останню міграцію |
| `npm run migration:show` | Показати застосовані міграції |
| `npm run migration:generate -- src/migrations/Назва` | Створити міграцію після зміни entity |
| `npm run seed` | Залити тестові дані |

У production `ts-node` немає — це dev-залежність. Тому для хостингу є
окремі варіанти `migration:*:prod`, які працюють з уже зібраних JS-файлів
у `dist/`, без `ts-node`.

### `frontend`

| Команда | Опис |
|---|---|
| `npm start` | Dev-сервер на `localhost:3000` |
| `npm run build` | Продакшен-збірка у `build/` |

---

## Типові проблеми

### `npm run migration:run` → «database does not exist»

Бази `Swiftly` немає. Створи:

```bash
docker exec -it swiftly-db psql -U postgres -c 'CREATE DATABASE "Swiftly";'
```

### Фронтенд показує `ERR_CONNECTION_REFUSED`

`REACT_APP_API_URL` вказує не на те порту. Перевір, що бекенд слухає
`PORT` з `.env`, а фронт — саме на `http://localhost:<PORT>`.
Після зміни `.env` перезапусти dev-сервер: CRA читає змінні **при старті**.

### `TokenExpiredError` / постійні 401

- `JWT_EXPIRES_IN` — час життя access-токена (за замовчуванням 15 хв).
- Перевір, що системний час правильний — JWT чутливий до нього.
- `JWT_REFRESH_SECRET` має збігатися між `login` і `refresh`.

### Каталог порожній, у консолі помилка

Подивися, що саме каже мережева вкладка. Типові:
- `400 property categoryId should not exist` — на API інша назва поля
- `400 property ... should not exist` — зайве поле в запиті

### `429 Too Many Requests`

Rate limiter: 10 спроб входу на хвилину з однієї адреси.

### Листи не приходять

`MAIL_HOST` порожній — лист пишеться в лог замість відправлення.
Заповни SMTP-параметри. Для Gmail потрібен app password, а не звичайний.

### `npm ci` can only install packages when package.json and package-lock.json are in sync

Lock-файл не збігається з `package.json`. Найчастіше через різні версії
npm — локально може стояти npm 11, а на CI буде npm 10, і вони по-різному
читають lock.

У `frontend/package.json` стоїть `overrides: { "yaml": "2.9.1" }` — це
прибирає конфлікт, через який дерево мінялося між версіями npm.

---

## Відомі обмеження

- `typeorm@1.0.0` не потрапляє в peer-діапазон `@nestjs/typeorm`
  (`^0.3.0 || ^1.0.0-dev`). Працює, але при оновленні Nest може зламатись.
- Swagger у production вимкнено за замовчуванням — це навмисно, бо документація
  показує всі маршрути разом з автентифікацією.