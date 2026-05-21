export const formatPrice = (value, currency = '₴') =>
  `${currency}${Number(value || 0).toLocaleString('uk-UA', { minimumFractionDigits: 2 })}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' });

export const statusLabel = {
  new: 'Нове',
  processing: 'Обробляється',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

export const roleLabel = {
  admin: 'Адмін',
  supplier: 'Постачальник',
  dropshipper: 'Дропшипер',
  customer: 'Покупець',
};

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '…' : str;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
