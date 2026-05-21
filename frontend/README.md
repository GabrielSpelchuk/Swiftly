# DropSync — Frontend

React-застосунок для платформи дропшипінгу.

## Технології

- **React 18** + React Router v6
- **Redux Toolkit** — глобальний стан (auth, cart)
- **Axios** — HTTP-клієнт з авто-рефрешем токенів
- **React Toastify** — сповіщення

## Запуск

```bash
npm install
cp .env.example .env
npm start
```

Відкриється на http://localhost:3000

## Структура проєкту

```
src/
├── api/
│   ├── axios.js          # Axios інстанс + interceptors (авторефреш JWT)
│   └── services.js       # Всі API-функції по модулях
│
├── store/
│   ├── index.js          # Redux store
│   └── slices/
│       ├── authSlice.js  # Авторизація (user, isLoading)
│       └── cartSlice.js  # Кошик
│
├── hooks/
│   ├── useAuth.js        # Зручний доступ до auth стану + role helpers
│   └── useCart.js        # Кошик + дії
│
├── utils/
│   └── format.js         # formatPrice, formatDate, ORDER_STATUS_LABELS
│
├── components/
│   ├── common/           # Button, Input, Select, Badge, Spinner, Modal
│   ├── layout/           # Navbar, Footer, PrivateRoute
│   ├── catalog/          # ProductCard, ProductFilters
│   ├── orders/           # OrderCard
│   └── dashboard/        # StatCard
│
├── pages/
│   ├── public/           # HomePage, CatalogPage, ProductPage, CartPage,
│   │                     # OrdersPage, OrderDetailPage, ProfilePage,
│   │                     # LoginPage, RegisterPage,
│   │                     # ForgotPasswordPage, ResetPasswordPage
│   └── dashboard/        # SupplierDashboard, DropshipperDashboard,
│                         # AdminDashboard, ProductFormPage
│
├── styles/
│   └── global.css        # CSS змінні, reset, базові стилі
│
├── App.jsx               # Routing + провайдери
└── index.js              # Entry point
```

## Ролі та доступ

| Роль         | Доступні сторінки                                              |
|--------------|----------------------------------------------------------------|
| `customer`   | Головна, Каталог, Кошик, Замовлення, Профіль                   |
| `dropshipper`| + Панель дропшипера (статистика, замовлення, баланс)           |
| `supplier`   | + Панель постачальника (товари, замовлення, виручка)            |
| `admin`      | + Адмін-панель (всі користувачі, категорії, статистика)        |

## Дизайн-система

**Тема:** Industrial Precision — темна, з жовто-помаранчевими акцентами  
**Шрифти:** Syne (заголовки) + DM Sans (текст)  
**Кольори:** CSS змінні в `styles/global.css`  
- `--accent: #F5A623` — головний акцент  
- `--surface-1/2/3` — рівні поверхонь  
- `--danger, --success, --info` — статусні кольори  

**Компоненти без border-radius** — гострий, промисловий стиль.  
**Hover:** offset shadow + translate(-Xpx, -Xpx) — ефект "підйому".
