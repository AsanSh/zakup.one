// Simple Node.js backend for zakup.one
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Demo products data
const PRODUCTS = [
    { id: 1, name: "Арматура А500С Ø8", category: "Арматура", subcategory: "Рифленая", unit: "м", price: 120, supplier: "Поставщик А", supplierId: "SUPA001" },
    { id: 2, name: "Арматура А500С Ø10", category: "Арматура", subcategory: "Рифленая", unit: "м", price: 145, supplier: "Поставщик Б", supplierId: "SUPB002" },
    { id: 3, name: "Арматура А500С Ø12", category: "Арматура", subcategory: "Рифленая", unit: "м", price: 170, supplier: "Поставщик А", supplierId: "SUPA001" },
    { id: 4, name: "Двутавр 10Б1", category: "Двутавры", subcategory: "Горячекатаные", unit: "м", price: 477, supplier: "Поставщик В", supplierId: "SUPC003" },
    { id: 5, name: "Двутавр 12Б1", category: "Двутавры", subcategory: "Горячекатаные", unit: "м", price: 520, supplier: "Поставщик В", supplierId: "SUPC003" },
    { id: 6, name: "Швеллер 8П", category: "Швеллеры", subcategory: "Горячекатаные", unit: "м", price: 320, supplier: "Поставщик Г", supplierId: "SUPD004" },
    { id: 7, name: "Швеллер 10П", category: "Швеллеры", subcategory: "Горячекатаные", unit: "м", price: 380, supplier: "Поставщик Г", supplierId: "SUPD004" },
    { id: 8, name: "Уголок 50x50x4", category: "Уголки", subcategory: "Равнополочные", unit: "м", price: 85, supplier: "Поставщик Д", supplierId: "SUPE005" },
    { id: 9, name: "Уголок 63x63x5", category: "Уголки", subcategory: "Равнополочные", unit: "м", price: 120, supplier: "Поставщик Д", supplierId: "SUPE005" },
    { id: 10, name: "Лист 2мм", category: "Листы", subcategory: "Горячекатаные", unit: "м²", price: 45, supplier: "Поставщик Е", supplierId: "SUPF006" },
    { id: 11, name: "Лист 3мм", category: "Листы", subcategory: "Горячекатаные", unit: "м²", price: 65, supplier: "Поставщик Е", supplierId: "SUPF006" },
    { id: 12, name: "Труба Ø57x3", category: "Трубы", subcategory: "Электросварные", unit: "м", price: 180, supplier: "Поставщик Ж", supplierId: "SUPG007" },
    { id: 13, name: "Труба Ø76x3", category: "Трубы", subcategory: "Электросварные", unit: "м", price: 220, supplier: "Поставщик Ж", supplierId: "SUPG007" },
    { id: 14, name: "Проволока Ø3мм", category: "Проволока", subcategory: "Сварочная", unit: "кг", price: 25, supplier: "Поставщик З", supplierId: "SUPH008" },
    { id: 15, name: "Проволока Ø4мм", category: "Проволока", subcategory: "Сварочная", unit: "кг", price: 30, supplier: "Поставщик З", supplierId: "SUPH008" },
    { id: 16, name: "Сетка 50x50x4", category: "Сетки", subcategory: "Сварные", unit: "м²", price: 180, supplier: "Поставщик И", supplierId: "SUPI009" },
    { id: 17, name: "Сетка 100x100x4", category: "Сетки", subcategory: "Сварные", unit: "м²", price: 120, supplier: "Поставщик И", supplierId: "SUPI009" },
    { id: 18, name: "Болт М8x20", category: "Крепеж", subcategory: "Болты", unit: "шт", price: 5, supplier: "Поставщик К", supplierId: "SUPJ010" },
    { id: 19, name: "Болт М10x30", category: "Крепеж", subcategory: "Болты", unit: "шт", price: 8, supplier: "Поставщик К", supplierId: "SUPJ010" },
    { id: 20, name: "Гайка М8", category: "Крепеж", subcategory: "Гайки", unit: "шт", price: 2, supplier: "Поставщик К", supplierId: "SUPJ010" }
];

// Routes

// Get all products with search and category filters
app.get('/api/products', (req, res) => {
    const { search = '', category = '' } = req.query;
    
    let filteredProducts = [...PRODUCTS];
    
    // Filter by search query
    if (search.trim().length > 0) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.supplier.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower)
        );
    }
    
    // Filter by category
    if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === category
        );
    }
    
    res.json(filteredProducts);
});

// Get all categories
app.get('/api/categories', (req, res) => {
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    res.json(categories.sort());
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const product = PRODUCTS.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

// Get products by supplier
app.get('/api/suppliers/:supplierId/products', (req, res) => {
    const products = PRODUCTS.filter(p => p.supplierId === req.params.supplierId);
    res.json(products);
});

// Create order
app.post('/api/orders', (req, res) => {
    const { customer, items, total } = req.body;
    
    if (!customer || !items || !total) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const order = {
        id: Date.now(),
        customer,
        items,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber: `#${Date.now()}`
    };
    
    console.log('📦 Новый заказ:', order);
    
    res.json({ 
        success: true, 
        order,
        message: 'Заказ успешно создан!' 
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    // In a real app, this would come from a database
    res.json([]);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📡 API доступно по адресу: http://localhost:${PORT}/api`);
    console.log(`🔍 Поиск товаров: http://localhost:${PORT}/api/products`);
    console.log(`📦 Создание заказа: POST http://localhost:${PORT}/api/orders`);
});

module.exports = app;
