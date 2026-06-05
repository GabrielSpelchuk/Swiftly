
INSERT INTO categories (name, slug, description, "createdAt", "updatedAt")
VALUES
  (
    'Електроніка',
    'elektronika',
    'Гаджети, навушники, зарядні пристрої',
    NOW(),
    NOW()
  ),
  (
    'Аксесуари',
    'aksesuary',
    'Чохли, тримачі, кабелі',
    NOW(),
    NOW()
  ),
  (
    'Для дому',
    'dlya-domu',
    'Освітлення, органайзери, декор',
    NOW(),
    NOW()
  ),
  (
    'Краса та здоров''я',
    'krasa-ta-zdorovya',
    'Догляд, фітнес-аксесуари',
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (
  name,
  description,
  "wholesalePrice",
  "retailPrice",
  stock,
  images,
  "isActive",
  "supplierId",
  "categoryId",
  "createdAt",
  "updatedAt"
)
SELECT
  v.name,
  v.description,
  v.wholesale_price,
  v.retail_price,
  v.stock,
  v.images,
  true,
  s.id,
  c.id,
  NOW(),
  NOW()
FROM (
  VALUES
    (
      'Бездротові навушники TWS Pro',
      'Bluetooth 5.3, шумозаглушення, кейс 400 mAh, до 24 год автономності.',
      450.00,
      799.00,
      120,
      ARRAY['https://placehold.co/600x600/1a1a2e/eee?text=TWS+Pro']::text[],
      'elektronika'
    ),
    (
      'Портативна колонка Bluetooth 20W',
      'Вологозахист IPX5, батарея 3600 mAh, AUX + microSD.',
      680.00,
      1199.00,
      85,
      ARRAY['https://placehold.co/600x600/16213e/eee?text=Speaker+20W']::text[],
      'elektronika'
    ),
    (
      'Power Bank 20000 mAh PD 22.5W',
      'Швидка зарядка USB-C, 2 виходи, індикатор рівня заряду.',
      520.00,
      899.00,
      200,
      ARRAY['https://placehold.co/600x600/0f3460/eee?text=PowerBank+20k']::text[],
      'elektronika'
    ),
    (
      'Веб-камера Full HD 1080p',
      'Мікрофон з шумозаглушенням, кріплення на монітор, plug-and-play USB.',
      380.00,
      649.00,
      60,
      ARRAY['https://placehold.co/600x600/533483/eee?text=Webcam+1080p']::text[],
      'elektronika'
    ),
    (
      'Чохол силіконовий для iPhone 15',
      'М''який силікон, захист камери, 6 кольорів у поставці (мікс).',
      95.00,
      199.00,
      350,
      ARRAY['https://placehold.co/600x600/e94560/eee?text=iPhone+15+Case']::text[],
      'aksesuary'
    ),
    (
      'Тримач для телефону в автомобіль',
      'На дефлектор, оберт 360°, сумісність 4.7–7 дюймів.',
      120.00,
      249.00,
      180,
      ARRAY['https://placehold.co/600x600/1a1a2e/eee?text=Car+Mount']::text[],
      'aksesuary'
    ),
    (
      'Органайзер для кабелів (набір 5 шт.)',
      'Силіконові фіксатори, самоклейна основа, для столу та стіни.',
      55.00,
      129.00,
      400,
      ARRAY['https://placehold.co/600x600/16213e/eee?text=Cable+Organizer']::text[],
      'aksesuary'
    ),
    (
      'LED-стрічка RGB 5 метрів',
      'Дистанційне керування, 16 млн кольорів, самоклейна основа.',
      210.00,
      399.00,
      150,
      ARRAY['https://placehold.co/600x600/0f3460/eee?text=LED+Strip+5m']::text[],
      'dlya-domu'
    ),
    (
      'Настільна лампа з USB-зарядкою',
      '3 режими яскравості, гнучкий корпус, вбудований порт USB-A.',
      290.00,
      549.00,
      90,
      ARRAY['https://placehold.co/600x600/533483/eee?text=Desk+Lamp']::text[],
      'dlya-domu'
    ),
    (
      'Термочохол для напоїв 500 мл',
      'Нержавіюча сталь, утримання температури до 6 год, герметична кришка.',
      175.00,
      349.00,
      110,
      ARRAY['https://placehold.co/600x600/e94560/eee?text=Thermo+Mug']::text[],
      'dlya-domu'
    ),
    (
      'Фітнес-браслет Smart Band M6',
      'Пульс, кроки, сон, сповіщення, водозахист IP67.',
      320.00,
      599.00,
      140,
      ARRAY['https://placehold.co/600x600/1a1a2e/eee?text=Smart+Band']::text[],
      'krasa-ta-zdorovya'
    ),
    (
      'Клавіатура бездротова compact',
      'Тихі клавіші, Bluetooth + USB-приймач, українська розкладка.',
      410.00,
      749.00,
      75,
      ARRAY[
        'https://placehold.co/600x600/16213e/eee?text=Keyboard+1',
        'https://placehold.co/600x600/0f3460/eee?text=Keyboard+2'
      ]::text[],
      'elektronika'
    )
) AS v(name, description, wholesale_price, retail_price, stock, images, category_slug)
CROSS JOIN LATERAL (
  SELECT id
  FROM users
  WHERE role = 'supplier'
  ORDER BY
    CASE WHEN email = 'gabrielspelciuc@gmail.com' THEN 0 ELSE 1 END,
    id
  LIMIT 1
) AS s
JOIN categories c ON c.slug = v.category_slug
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = v.name
);

COMMIT;

SELECT
  p.id,
  p.name,
  p."wholesalePrice",
  p."retailPrice",
  p.stock,
  c.name AS category,
  u.email AS supplier
FROM products p
LEFT JOIN categories c ON c.id = p."categoryId"
LEFT JOIN users u ON u.id = p."supplierId"
ORDER BY p.id;
