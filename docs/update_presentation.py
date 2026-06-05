#!/usr/bin/env python3
"""Оновлення Swiftly_Presentation.odp за планом захисту (11 слайдів)."""
import shutil
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ODP_PATH = Path('/home/gabriel/Study/Swiftly_Presentation.odp')
BACKUP_PATH = ODP_PATH.with_suffix('.odp.bak')
WORK_DIR = Path('/tmp/swiftly_odp_edit')

NS = {
    'office': 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
    'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
    'draw': 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
}
TEXT_NS = NS['text']


def get_page_texts(page):
    texts = []
    for p in page.findall('.//text:p', NS):
        t = ''.join(p.itertext()).strip()
        if t and t != '<номер>':
            texts.append((p, t))
    return texts


def set_paragraph_text(p_elem, new_text):
    for child in list(p_elem):
        p_elem.remove(child)
    span = ET.SubElement(p_elem, f'{{{TEXT_NS}}}span')
    span.text = new_text


def apply_slide(page, new_lines):
    blocks = get_page_texts(page)
    if len(blocks) != len(new_lines):
        print(f'  ⚠ кількість блоків {len(blocks)} ≠ {len(new_lines)} — часткове оновлення')
    for i, (p_elem, _old) in enumerate(blocks):
        if i < len(new_lines):
            set_paragraph_text(p_elem, new_lines[i])


SLIDE_CONTENT = {
    0: None,  # slide 1 — точкові заміни
    1: [
        'АКТУАЛЬНІСТЬ, МЕТА ТА ЗАВДАННЯ',
        '⚠ ПРОБЛЕМА',
        'Роздробленість потоків B2B та B2C — постачальникам складно консолідувати замовлення',
        'Залишки та ціни передаються вручну (месенджери, таблиці)',
        'Відсутній єдиний облік маржі дропшипера та статусів замовлень',
        'Більшість рішень — або B2B-кабінет, або B2C-вітрина, без інтеграції',
        "ОБ'ЄКТ: процеси організації дропшипінгової торгівлі в ІТ-середовищі",
        'ПРЕДМЕТ: методи та засоби веб-автоматизації B2B/B2C взаємодії',
        'МЕТА: розробити веб-платформу Swiftly для постачальників, дропшиперів і покупців',
        'ЗАВДАННЯ: аналіз аналогів → вимоги → архітектура → API/БД → SPA → тестування',
        'Очікуваний результат: зменшення ручної праці та прозорість маржі/залишків',
    ],
    2: None,  # аналоги — лише Swiftly
    3: [
        'ПОСТАНОВКА ЗАДАЧІ — ВИМОГИ',
        'ФУНКЦІОНАЛЬНІ ВИМОГИ',
        'Авторизація',
        'Реєстрація, email-активація, JWT, відновлення пароля',
        'Каталог',
        'Фільтри, пошук, роздрібні/гуртові ціни залежно від ролі',
        'Замовлення',
        'Кошик, оформлення B2B/B2C, статуси, трек-номер',
        'Кабінети',
        'Постачальник: CRUD товарів; дропшипер: маржа; адмін: модерація',
        'НЕФУНКЦІОНАЛЬНІ ВИМОГИ',
        'Безпека',
        'bcrypt, RBAC-middleware, httpOnly refresh-cookie',
        'Продуктивність',
        'Відгук UI до 2 с; API на локальному стенді < 200 ms',
        'Надійність',
        'Транзакції PostgreSQL при створенні замовлення',
        'Зручність',
        'Україномовний UI, адаптивна вітрина, toast-повідомлення',
        'СЦЕНАРІЇ (USE CASE)',
        'UC-1',
        'Реєстрація / вхід / активація',
        'UC-2',
        'Перегляд каталогу та оформлення замовлення',
        'UC-3',
        'Управління товарами постачальником',
        'UC-4',
        'Модерація заявки дропшипера адміністратором',
        'РОЛІ СИСТЕМИ',
        'Admin · Supplier · Dropshipper · Customer',
        'Обмеження',
        'ізоляція даних постачальника; валідація на API',
    ],
    4: [
        'АРХІТЕКТУРА СИСТЕМИ',
        'Клієнт–сервер: React SPA ↔ REST API ↔ PostgreSQL',
        'Frontend',
        'React 18, Redux Toolkit, React Router v6, Axios',
        'Backend',
        'Node.js, Express 5, Sequelize ORM, JWT, bcrypt',
        'База даних',
        'PostgreSQL: 8 таблиць, ENUM-типи, зовнішні ключі',
        'users',
        '4 ролі, баланс, поля модерації дропшипера',
        'products',
        'wholesalePrice, retailPrice, stock, images[]',
        'categories',
        'назва, slug (транслітерація UA)',
        'orders + order_items',
        'B2B/B2C, margin, фіксація цін у позиціях',
        'carts + cart_items',
        'кошик авторизованого користувача',
        'tokens',
        'зберігання refresh-token',
        'Зв\'язок',
        'REST/JSON · CORS · credentials для cookie',
    ],
    5: [
        'КЛЮЧОВЕ РІШЕННЯ 1: ЗАМОВЛЕННЯ ТА МОДЕЛЬ ДАНИХ',
        'Транзакція createOrder: перевірка stock → order → order_items → списання',
        'B2B',
        'джерело b2b — дропшипер (після isApproved)',
        'B2C',
        'джерело b2c — прямий покупець',
        'margin',
        'totalRetail − totalWholesale на рівні замовлення',
        'Ціни в каталозі',
        'optionalAuth + role: дропшипер бачить wholesale лише після схвалення',
        'Категорії',
        'slugify з підтримкою кирилиці (українські назви)',
        'Зображення',
        'масив URL у полі images (PostgreSQL TEXT[])',
        '→',
        '',
        '→',
        '',
        '→',
        '',
        '→',
        '',
        '→',
        '',
        'ЕНДПОЇНТИ (фрагмент)',
        'POST',
        '/orders — створення замовлення',
        'GET',
        '/products — каталог (role-aware prices)',
        'PATCH',
        '/orders/:id/status — статус постачальником',
        'GET',
        '/admin/dropshippers/pending — черга модерації',
        'PATCH',
        '/admin/dropshippers/:id/review — approve/reject',
        'GET',
        '/analytics/stats — статистика за роллю',
        'DELETE',
        '/products/:id — видалення товару постачальником',
        'Разом',
        '~29 REST-ендпоїнтів',
    ],
    6: [
        'КЛЮЧОВЕ РІШЕННЯ 2: БЕЗПЕКА ТА RBAC',
        'JWT access (15 хв) + refresh (30 днів, httpOnly cookie)',
        'authMiddleware',
        'перевірка Bearer access-token',
        'requireRole(...)',
        'обмеження маршрутів admin / supplier / dropshipper',
        'Модерація дропшипера',
        'phone, shopUrl, salesChannel, experience → isApproved=false',
        'Після login',
        'непідтверджений дропшипер: каталог без wholesale, окремий екран очікування',
        'Axios interceptor',
        'авто-refresh при 401, черга паралельних запитів',
        'Валідація',
        'клієнт + сервер (400/403/409), Sequelize unique → зрозумілі повідомлення',
    ],
    7: [
        'ДЕМОНСТРАЦІЯ РЕЗУЛЬТАТІВ (1/2) — B2C',
        'Публічна вітрина: головна, каталог, картка товару',
        'Каталог',
        'фільтри за категорією, ціною, пошуком',
        'Кошик',
        'групування позицій за постачальником',
        'Чекаут',
        'форма: ПІБ, телефон, адреса доставки',
        'UX',
        'toast після POST /orders; темна тема Swiftly',
    ],
    8: [
        'ДЕМОНСТРАЦІЯ РЕЗУЛЬТАТІВ (2/2) — B2B та адмін',
        'Кабінет дропшипера: StatCard, маржа %, замовлення',
        'Кабінет постачальника',
        'CRUD товарів, зображення за URL, видалення, залишки',
        'Адмін-панель',
        'користувачі, категорії, заявки дропшиперів',
        'Реєстрація дропшипера',
        'додаткові поля верифікації перед доступом до гурту',
        'Скриншоти',
        'на слайді — реальні екрани системи',
    ],
    9: [
        'ТЕСТУВАННЯ ТА ВИСНОВКИ',
        '01 — Auth, JWT, email-активація: OK',
        '02 — RBAC, модерація дропшипера: OK',
        '03 — Замовлення (stock↓, margin): OK',
        '04 — CRUD товарів, категорії (UA): OK',
        '05 — Seed 12 товарів (test-data.sql): OK',
        'ВИСНОВКИ',
        'Розроблено Swiftly: B2B+B2C, 8 таблиць, ~29 API',
        'Перспективи: оплата, API доставки, mobile',
    ],
}

# Слайд 11 — подяка (точкові заміни + висновки в підзаголовку)
THANKS_REPLACEMENTS = {
    'Група 344А · ЧНУ ім. Юрія Федьковича · 2026': "Кафедра комп'ютерних наук · ЧНУ · 2026",
    'Готовий відповісти на запитання':
        'Висновок: Swiftly (B2B+B2C), 8 таблиць, JWT+RBAC, модерація дропшиперів',
    '6': '8',
    '18': '29',
    '13/13': '12',
    'критеріїв': 'тест-товарів',
}

POINT_REPLACEMENTS = {
    'React 19': 'React 18',
    'Swiflty ✦': 'Swiftly ✦',
    'Платформа B2B + B2C для постачальників, дропшиперів і покупців':
        'Кваліфікаційна робота: веб-платформа автоматизації дропшипінгу (B2B/B2C)',
    'ЧНУ ім. Юрія Федьковича · Чернівці, 2026':
        "Кафедра комп'ютерних наук · ЧНУ ім. Юрія Федьковича · 2026",
}


def main():
    if not BACKUP_PATH.exists():
        shutil.copy2(ODP_PATH, BACKUP_PATH)
    else:
        shutil.copy2(BACKUP_PATH, ODP_PATH)

    if WORK_DIR.exists():
        shutil.rmtree(WORK_DIR)
    WORK_DIR.mkdir()

    with zipfile.ZipFile(ODP_PATH, 'r') as zin:
        zin.extractall(WORK_DIR)

    content_path = WORK_DIR / 'content.xml'
    tree = ET.parse(content_path)
    root = tree.getroot()
    pages = root.findall('.//draw:page', NS)

    print(f'Слайдів: {len(pages)}')

    for slide_idx, page in enumerate(pages):
        blocks = get_page_texts(page)

        if slide_idx in SLIDE_CONTENT and SLIDE_CONTENT[slide_idx] is not None:
            print(f'Слайд {slide_idx + 1}: повне оновлення ({len(blocks)} блоків)')
            apply_slide(page, SLIDE_CONTENT[slide_idx])
        else:
            replacements = {**POINT_REPLACEMENTS, **(THANKS_REPLACEMENTS if slide_idx == 10 else {})}
            for p_elem, old in blocks:
                if old in replacements:
                    set_paragraph_text(p_elem, replacements[old])
            if slide_idx in (0, 10):
                print(f'Слайд {slide_idx + 1}: точкові заміни')

    tree.write(content_path, encoding='UTF-8', xml_declaration=True)

    with zipfile.ZipFile(ODP_PATH, 'w', zipfile.ZIP_DEFLATED) as zout:
        for file_path in WORK_DIR.rglob('*'):
            if file_path.is_file():
                zout.write(file_path, file_path.relative_to(WORK_DIR))

    print(f'✅ Збережено: {ODP_PATH}')
    print(f'   Резервна копія: {BACKUP_PATH}')


if __name__ == '__main__':
    main()
