// Demo data for zakup.one application

const demoData = {
    // User profile data
    user: {
        id: 12345,
        name: "Пользователь",
        company: "ООО СтройМатериалы",
        email: "user@zakup.one",
        phone: "+996 555 123 456",
        avatar: "Avatar"
    },

    // Orders data
    orders: [
        {
            id: "2024-001",
            date: "15.10.2024",
            status: "completed",
            amount: 12450,
            items: [
                { name: "Арматура А500С 8мм", quantity: 10, price: 485 },
                { name: "Двутавр 10Б1", quantity: 5, price: 477 }
            ]
        },
        {
            id: "2024-002", 
            date: "14.10.2024",
            status: "processing",
            amount: 8320,
            items: [
                { name: "Двутавр 12Б1", quantity: 3, price: 573 },
                { name: "Двутавр 14Б1", quantity: 2, price: 473 }
            ]
        },
        {
            id: "2024-003",
            date: "13.10.2024", 
            status: "completed",
            amount: 15680,
            items: [
                { name: "Арматура А500С 12мм", quantity: 8, price: 580 },
                { name: "Арматура А500С 14мм", quantity: 6, price: 650 }
            ]
        },
        {
            id: "2024-004",
            date: "12.10.2024",
            status: "completed", 
            amount: 9450,
            items: [
                { name: "Арматура А500С 16мм", quantity: 4, price: 720 },
                { name: "Двутавр 10Б1", quantity: 3, price: 477 }
            ]
        },
        {
            id: "2024-005",
            date: "11.10.2024",
            status: "cancelled",
            amount: 5200,
            items: [
                { name: "Арматура А500С 8мм", quantity: 5, price: 485 }
            ]
        }
    ],

    // Statistics data
    statistics: {
        totalOrders: 24,
        totalAmount: 156420,
        completedOrders: 18,
        processingOrders: 6,
        cancelledOrders: 0,
        averageOrderValue: 6517.5,
        monthlyGrowth: 12.5
    },

    // Limits data
    limits: {
        monthlyOrderLimit: {
            current: 75000,
            max: 100000,
            status: "active"
        },
        dailyOrderCount: {
            current: 2,
            max: 5,
            status: "active"
        },
        creditLimit: {
            current: 45000,
            max: 50000,
            status: "warning"
        }
    },

    // Products data
    products: [
        {
            id: 1,
            name: "Арматура А500С 8мм",
            price: 485,
            unit: "шт",
            supplier: "СтройДвор",
            category: "Арматура",
            inStock: true,
            stockQuantity: 150
        },
        {
            id: 2,
            name: "Арматура А500С 10мм", 
            price: 520,
            unit: "шт",
            supplier: "СтройДвор",
            category: "Арматура",
            inStock: true,
            stockQuantity: 120
        },
        {
            id: 3,
            name: "Арматура А500С 12мм",
            price: 580,
            unit: "шт", 
            supplier: "СтройДвор",
            category: "Арматура",
            inStock: true,
            stockQuantity: 100
        },
        {
            id: 4,
            name: "Арматура А500С 14мм",
            price: 650,
            unit: "шт",
            supplier: "СтройДвор", 
            category: "Арматура",
            inStock: true,
            stockQuantity: 80
        },
        {
            id: 5,
            name: "Арматура А500С 16мм",
            price: 720,
            unit: "шт",
            supplier: "СтройДвор",
            category: "Арматура",
            inStock: true,
            stockQuantity: 60
        },
        {
            id: 6,
            name: "Двутавр 10Б1",
            price: 477,
            unit: "шт",
            supplier: "СтройДвор",
            category: "Двутавры",
            inStock: true,
            stockQuantity: 45
        },
        {
            id: 7,
            name: "Двутавр 12Б1",
            price: 573,
            unit: "шт",
            supplier: "СтройДвор",
            category: "Двутавры",
            inStock: true,
            stockQuantity: 35
        },
        {
            id: 8,
            name: "Двутавр 14Б1",
            price: 473,
            unit: "шт",
            supplier: "СтройДвор",
            category: "Двутавры",
            inStock: true,
            stockQuantity: 25
        }
    ],

    // Settings data
    settings: {
        notifications: {
            push: true,
            orders: true,
            email: false
        },
        app: {
            darkTheme: false,
            autoSaveCart: true,
            showPricesWithVAT: true
        },
        security: {
            twoFactorAuth: false,
            biometricAuth: false
        }
    },

    // Company data
    company: {
        name: "ООО СтройМатериалы",
        inn: "12345678901234",
        address: "г. Бишкек, ул. Чуй 123",
        phone: "+996 312 123 456",
        email: "info@stroy-materials.kg",
        director: "Иванов Иван Иванович"
    },

    // Addresses data
    addresses: [
        {
            id: 1,
            name: "Основной склад",
            address: "г. Бишкек, ул. Чуй 123",
            isDefault: true
        },
        {
            id: 2,
            name: "Склад №2",
            address: "г. Бишкек, ул. Московская 456",
            isDefault: false
        }
    ],

    // Payment methods data
    paymentMethods: [
        {
            id: 1,
            name: "Банковский перевод",
            type: "bank_transfer",
            isDefault: true
        },
        {
            id: 2,
            name: "Наличные при получении",
            type: "cash",
            isDefault: false
        },
        {
            id: 3,
            name: "Банковская карта",
            type: "card",
            isDefault: false
        }
    ]
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = demoData;
} else {
    window.demoData = demoData;
}
