-- Создание демо-данных: поставщик и товары

-- Создаем демо-поставщика
INSERT INTO suppliers (name, contact_email, contact_phone, is_active, created_at)
VALUES (
  'Демо Поставщик',
  'demo@supplier.com',
  '+996555123456',
  true,
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Получаем ID поставщика
DO $$
DECLARE
  supplier_id_var INTEGER;
BEGIN
  SELECT id INTO supplier_id_var FROM suppliers WHERE name = 'Демо Поставщик';
  
  -- Создаем демо-товары только если их еще нет
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, unit, price, category, country, supplier_id, is_active, created_at)
    VALUES
      ('Арматура А12', 'м', 150.0, 'Арматура', 'КР', supplier_id_var, true, NOW()),
      ('Арматура А14', 'м', 180.0, 'Арматура', 'КР', supplier_id_var, true, NOW()),
      ('Арматура А16', 'м', 220.0, 'Арматура', 'КР', supplier_id_var, true, NOW()),
      ('Цемент М400', 'мешок', 350.0, 'Цемент', 'КР', supplier_id_var, true, NOW()),
      ('Цемент М500', 'мешок', 420.0, 'Цемент', 'КР', supplier_id_var, true, NOW()),
      ('Песок речной', 'м³', 800.0, 'Песок', 'КР', supplier_id_var, true, NOW()),
      ('Щебень 20-40', 'м³', 1200.0, 'Щебень', 'КР', supplier_id_var, true, NOW()),
      ('Бетон М200', 'м³', 4500.0, 'Бетон', 'КР', supplier_id_var, true, NOW()),
      ('Бетон М300', 'м³', 5200.0, 'Бетон', 'КР', supplier_id_var, true, NOW()),
      ('Кирпич красный', 'шт', 25.0, 'Кирпич', 'КР', supplier_id_var, true, NOW()),
      ('Кирпич белый', 'шт', 30.0, 'Кирпич', 'КР', supplier_id_var, true, NOW()),
      ('Профнастил С8', 'м²', 450.0, 'Профнастил', 'КР', supplier_id_var, true, NOW()),
      ('Профнастил С20', 'м²', 520.0, 'Профнастил', 'КР', supplier_id_var, true, NOW()),
      ('Металлочерепица', 'м²', 650.0, 'Кровля', 'КР', supplier_id_var, true, NOW()),
      ('Ондулин', 'лист', 450.0, 'Кровля', 'КР', supplier_id_var, true, NOW()),
      ('Доска обрезная 50x150', 'м³', 35000.0, 'Пиломатериалы', 'КР', supplier_id_var, true, NOW()),
      ('Брус 100x100', 'м³', 42000.0, 'Пиломатериалы', 'КР', supplier_id_var, true, NOW()),
      ('Гипсокартон 12.5мм', 'лист', 450.0, 'Гипсокартон', 'КР', supplier_id_var, true, NOW()),
      ('Гипсокартон 9.5мм', 'лист', 380.0, 'Гипсокартон', 'КР', supplier_id_var, true, NOW()),
      ('Плитка керамическая', 'м²', 1200.0, 'Плитка', 'КР', supplier_id_var, true, NOW());
    
    RAISE NOTICE 'Создано 20 демо-товаров';
  ELSE
    RAISE NOTICE 'Товары уже существуют, пропускаем создание';
  END IF;
END $$;

-- Проверка
SELECT 
  (SELECT COUNT(*) FROM suppliers WHERE name = 'Демо Поставщик') as suppliers_count,
  (SELECT COUNT(*) FROM products) as products_count;

