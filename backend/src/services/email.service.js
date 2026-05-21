require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Активація акаунту</h1>
    <p>Дякуємо за реєстрацію! Натисніть посилання нижче для активації вашого акаунту:</p>
    <a href="${href}">${href}</a>
  `;
  return send({ email, html, subject: 'Активація акаунту' });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Скидання паролю</h1>
    <p>Ви запросили скидання паролю. Натисніть посилання нижче:</p>
    <a href="${href}">${href}</a>
    <p>Якщо це були не ви — проігноруйте цей лист.</p>
  `;
  return send({ email, html, subject: 'Скидання паролю' });
}

function sendOrderStatusEmail(email, orderStatus, trackingNumber = null) {
  const statusLabels = {
    new: 'Нове',
    processing: 'Обробляється',
    shipped: 'Відправлено',
    delivered: 'Доставлено',
    cancelled: 'Скасовано',
  };

  let html = `<h2>Статус вашого замовлення: ${statusLabels[orderStatus] || orderStatus}</h2>`;
  if (trackingNumber) {
    html += `<p>Трек-номер відправлення: <strong>${trackingNumber}</strong></p>`;
  }

  return send({ email, html, subject: `Оновлення статусу замовлення` });
}

module.exports = { send, sendActivationEmail, sendResetPasswordEmail, sendOrderStatusEmail };
