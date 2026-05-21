import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <div className="home__hero-inner">
            <div className="home__hero-tag">Платформа дропшипінгу</div>
            <h1 className="home__hero-title">
              Автоматизуй<br />
              <span className="home__hero-accent">свій бізнес</span><br />
              з першого дня
            </h1>
            <p className="home__hero-desc">
              Підключайся до постачальників, управляй замовленнями та відстежуй прибуток — все в одному місці.
            </p>
            <div className="home__hero-actions">
              <Link to="/register" className="home__cta-primary">Почати безкоштовно</Link>
              <Link to="/catalog" className="home__cta-secondary">Переглянути каталог →</Link>
            </div>
          </div>

          <div className="home__hero-visual">
            <div className="home__panel">
              <div className="home__panel-row home__panel-row--header">
                <span>▲ DROPSYNC</span><span style={{color:'var(--success)'}}>● LIVE</span>
              </div>
              {[
                { label: 'Прибуток сьогодні', value: '₴ 4,850', up: true },
                { label: 'Нові замовлення', value: '23', up: true },
                { label: 'Активних товарів', value: '1,240', up: false },
                { label: 'Конверсія', value: '3.8%', up: true },
              ].map((row) => (
                <div key={row.label} className="home__panel-row">
                  <span className="home__panel-label">{row.label}</span>
                  <span className="home__panel-value">{row.value}</span>
                  <span style={{ color: row.up ? 'var(--success)' : 'var(--text-muted)', fontSize: 11 }}>{row.up ? '↑' : '→'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home__features container">
        <div className="home__features-label">ЯК ЦЕ ПРАЦЮЄ</div>
        <div className="home__features-grid">
          {[
            { num: '01', title: 'Оберіть роль', desc: 'Постачальник, дропшипер або покупець — кожен отримує свою панель.' },
            { num: '02', title: 'Підключіть товари', desc: 'Постачальники додають каталог. Дропшипери вибирають що продавати.' },
            { num: '03', title: 'Отримуйте замовлення', desc: 'B2B і B2C потоки замовлень з трекінгом і автоматичним обліком прибутку.' },
            { num: '04', title: 'Аналізуйте', desc: 'Графіки маржі, балансу, топ товарів — реальні дані для рішень.' },
          ].map((f) => (
            <div key={f.num} className="home__feature-card">
              <div className="home__feature-num">{f.num}</div>
              <h3 className="home__feature-title">{f.title}</h3>
              <p className="home__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home__roles container">
        {[
          { role: 'Постачальник', color: 'var(--info)', desc: 'Додавайте товари, встановлюйте гуртові ціни, обробляйте B2B та B2C замовлення.', link: '/register', cta: 'Стати постачальником' },
          { role: 'Дропшипер', color: 'var(--accent)', desc: 'Продавайте без складу. Бачте гуртові ціни, керуйте маржею та балансом.', link: '/register', cta: 'Стати дропшипером' },
          { role: 'Покупець', color: 'var(--success)', desc: 'Зручний каталог, кошик, відстеження замовлень без реєстрації.', link: '/catalog', cta: 'До каталогу' },
        ].map((r) => (
          <div key={r.role} className="home__role-card" style={{ '--role-color': r.color }}>
            <div className="home__role-tag">{r.role}</div>
            <p className="home__role-desc">{r.desc}</p>
            <Link to={r.link} className="home__role-link">{r.cta} →</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
