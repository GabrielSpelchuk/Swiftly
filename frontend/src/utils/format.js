export const formatPrice = (price) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(price);

export const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));

export const ORDER_STATUS_LABELS = {
  new: 'Нове',
  processing: 'Обробляється',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

export const ORDER_STATUS_COLORS = {
  new: '#5B9CF6',
  processing: '#F5A623',
  shipped: '#9B7FE8',
  delivered: '#4CAF7D',
  cancelled: '#E0503A',
};

export const ROLE_LABELS = {
  admin: 'Адміністратор',
  supplier: 'Постачальник',
  dropshipper: 'Дропшипер',
  customer: 'Покупець',
};
