import React, { useEffect, useState } from 'react';
import { analyticsApi, adminApi, categoryApi } from '../../api/services';
import { StatCard } from '../../components/dashboard/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { formatPrice, ROLE_LABELS } from '../../utils/format';
import { toast } from 'react-toastify';
import './Dashboard.css';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [pendingDropshippers, setPendingDropshippers] = useState([]);

  const categoryErrorMessage = (err) =>
    err.response?.data?.message || 'Помилка операції з категорією';

  const loadData = () => {
    Promise.all([
      analyticsApi.getStats(),
      adminApi.getUsers(),
      categoryApi.getAll(),
      adminApi.getPendingDropshippers(),
    ])
      .then(([s, u, c, p]) => {
        setStats(s.data);
        setUsers(u.data);
        setCategories(c.data);
        setPendingDropshippers(p.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  const handleBlock = async (id, blocked) => {
    try {
      if (blocked) await adminApi.unblockUser(id);
      else await adminApi.blockUser(id);
      toast.success(blocked ? 'Розблоковано' : 'Заблоковано');
      loadData();
    } catch { toast.error('Помилка'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Видалити користувача?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('Користувача видалено');
      loadData();
    } catch { toast.error('Помилка'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await categoryApi.create({ name: newCategory.trim() });
      toast.success('Категорію додано');
      setNewCategory('');
      loadData();
    } catch (err) {
      toast.error(categoryErrorMessage(err));
    }
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleSaveCategory = async (id) => {
    if (!editingCategoryName.trim()) {
      toast.error('Назва не може бути порожньою');
      return;
    }
    try {
      await categoryApi.update(id, { name: editingCategoryName.trim() });
      toast.success('Категорію оновлено');
      cancelEditCategory();
      loadData();
    } catch (err) {
      toast.error(categoryErrorMessage(err));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Видалити категорію? Товари залишаться без категорії.')) return;
    try {
      await categoryApi.remove(id);
      toast.success('Видалено');
      if (editingCategoryId === id) cancelEditCategory();
      loadData();
    } catch (err) {
      toast.error(categoryErrorMessage(err));
    }
  };

  const handleReviewDropshipper = async (userId, status) => {
    const label = status === 'approve' ? 'підтвердити' : 'відхилити';
    if (!window.confirm(`Ви впевнені, що хочете ${label} цього дропшипера?`)) return;
    try {
      const { data } = await adminApi.reviewDropshipper(userId, status);
      toast.success(data.message || 'Готово');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dashboard container">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__tag">АДМІНІСТРАТОР</div>
          <h1 className="dashboard__title">Панель управління</h1>
        </div>
      </div>

      <div className="dashboard__stats">
        <StatCard label="Всього користувачів" value={stats?.totalUsers || 0} icon="👥" />
        <StatCard label="Всього замовлень" value={stats?.totalOrders || 0} icon="📦" accent />
        <StatCard label="Загальна виручка" value={stats?.totalRevenue ? formatPrice(stats.totalRevenue) : '₴ 0'} icon="💰" />
        <StatCard label="Категорій" value={categories.length} icon="🏷" />
      </div>

      <div className="dashboard__tabs">
        {['stats', 'dropshippers', 'users', 'categories'].map((t) => (
          <button key={t} className={`dashboard__tab ${activeTab === t ? 'dashboard__tab--active' : ''}`} onClick={() => setActiveTab(t)}>
            {{
              stats: 'Статистика',
              dropshippers: `Заявки дропшиперів${pendingDropshippers.length ? ` (${pendingDropshippers.length})` : ''}`,
              users: 'Користувачі',
              categories: 'Категорії',
            }[t]}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && stats?.usersByRole && (
        <div className="dashboard__section">
          <div className="dashboard__section-title">Користувачі по ролях</div>
          <div className="dashboard__stats">
            {stats.usersByRole.map((r) => (
              <StatCard key={r.role} label={ROLE_LABELS[r.role] || r.role} value={r.count} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'dropshippers' && (
        <div className="dashboard__section">
          {pendingDropshippers.length === 0 ? (
            <div className="dashboard__empty">Немає заявок на перевірку</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingDropshippers.map((d) => (
                <div
                  key={d.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 20,
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <strong>{d.name}</strong>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="sm" onClick={() => handleReviewDropshipper(d.id, 'approve')}>
                        Підтвердити
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReviewDropshipper(d.id, 'reject')}>
                        Відхилити
                      </Button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                    <div><strong>Телефон:</strong> {d.phone || '—'}</div>
                    <div><strong>Канал продажів:</strong> {d.salesChannel || '—'}</div>
                    <div>
                      <strong>Магазин / сторінка:</strong>{' '}
                      {d.shopUrl ? (
                        <a href={d.shopUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                          {d.shopUrl}
                        </a>
                      ) : '—'}
                    </div>
                    <div>
                      <strong>Досвід / докази:</strong>
                      <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                        {d.experience || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard__section">
          <div className="products-table">
            <div className="products-table__head" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
              <span>Ім'я</span><span>Email</span><span>Роль</span><span>Статус</span><span>Дії</span>
            </div>
            {users.map((u) => (
              <div key={u.id} className="products-table__row" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                <span>{u.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{u.email}</span>
                <Badge color={u.role === 'admin' ? 'var(--danger)' : u.role === 'supplier' ? 'var(--info)' : u.role === 'dropshipper' ? 'var(--accent)' : 'var(--success)'}>
                  {ROLE_LABELS[u.role]}
                </Badge>
                <span style={{
                  color: u.isBlocked ? 'var(--danger)' : u.role === 'dropshipper' && !u.isApproved ? 'var(--warning)' : 'var(--success)',
                  fontSize: 12,
                }}>
                  {u.isBlocked ? 'Заблокований' : u.role === 'dropshipper' && !u.isApproved ? 'Очікує схвалення' : 'Активний'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {u.role !== 'admin' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => handleBlock(u.id, u.isBlocked)}>
                        {u.isBlocked ? 'Розбл.' : 'Блок.'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u.id)}>✕</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="dashboard__section">
          <form onSubmit={handleAddCategory} className="dashboard__add-form">
            <Input placeholder="Назва категорії" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
            <Button type="submit">Додати</Button>
          </form>
          <div className="products-table" style={{ marginTop: 16 }}>
            <div className="products-table__head" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
              <span>Назва</span><span>Slug</span><span>Дії</span>
            </div>
            {categories.map((c) => (
              <div key={c.id} className="products-table__row" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
                {editingCategoryId === c.id ? (
                  <Input
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleSaveCategory(c.id); }
                      if (e.key === 'Escape') cancelEditCategory();
                    }}
                  />
                ) : (
                  <span>{c.name}</span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.slug || '—'}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {editingCategoryId === c.id ? (
                    <>
                      <Button size="sm" onClick={() => handleSaveCategory(c.id)}>Зберегти</Button>
                      <Button size="sm" variant="secondary" onClick={cancelEditCategory}>Скасувати</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => startEditCategory(c)}>Редагувати</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteCategory(c.id)}>Видалити</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
