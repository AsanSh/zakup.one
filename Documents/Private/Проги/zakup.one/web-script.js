// Web Version JavaScript
let cart = [];
let products = [];
let filteredProducts = [];
let currentView = 'grid';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    updateCartDisplay();
});

function initializeApp() {
    // Load demo products
    if (window.demoData && window.demoData.products) {
        products = window.demoData.products;
        filteredProducts = [...products];
    } else {
        // Fallback demo data
        products = [
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
                name: "Двутавр 10Б1",
                price: 477,
                unit: "шт",
                supplier: "МеталлСтрой",
                category: "Двутавры",
                inStock: true,
                stockQuantity: 45
            },
            {
                id: 4,
                name: "Двутавр 12Б1",
                price: 573,
                unit: "шт",
                supplier: "МеталлСтрой",
                category: "Двутавры",
                inStock: true,
                stockQuantity: 35
            },
            {
                id: 5,
                name: "Труба стальная 50мм",
                price: 1200,
                unit: "м",
                supplier: "СтройМатериалы",
                category: "Трубы",
                inStock: true,
                stockQuantity: 80
            },
            {
                id: 6,
                name: "Кирпич красный М150",
                price: 15,
                unit: "шт",
                supplier: "БетонПлюс",
                category: "Кирпич",
                inStock: true,
                stockQuantity: 2000
            }
        ];
        filteredProducts = [...products];
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProducts();
        });
    }

    // Category filters
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.textContent.trim();
            filterByCategory(category);
            
            // Update active state
            document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Supplier filters
    document.querySelectorAll('.filter-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            filterProducts();
        });
    });

    // Price range
    const priceSlider = document.querySelector('.price-slider');
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            filterProducts();
        });
    }

    // View toggles
    document.querySelectorAll('.view-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
            
            // Update active state
            document.querySelectorAll('.view-toggle').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Cart toggle
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');

    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            cartSidebar.classList.add('open');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
        });
    }

    // Sort functionality
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }

    // Version switcher
    const versionSwitcher = document.getElementById('version-switcher');
    if (versionSwitcher) {
        versionSwitcher.addEventListener('click', function() {
            // Redirect to Telegram app version
            window.location.href = '/app.html';
        });
    }
}

function loadProducts() {
    renderProducts();
    updateProductCount();
}

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-header">
            <div>
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
            </div>
            <div class="product-supplier">${product.supplier}</div>
        </div>
        <div class="product-price">
            ${product.price.toLocaleString()} сом
            <span class="product-unit">/${product.unit}</span>
        </div>
        <div class="product-actions">
            <div class="quantity-controls">
                <button class="qty-btn minus" data-product-id="${product.id}">-</button>
                <input type="number" value="1" min="1" max="${product.stockQuantity}" class="qty-input" data-product-id="${product.id}">
                <button class="qty-btn plus" data-product-id="${product.id}">+</button>
            </div>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
                В корзину
            </button>
        </div>
    `;

    // Add event listeners
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const qtyInput = card.querySelector('.qty-input');
    const addToCartBtn = card.querySelector('.add-to-cart-btn');

    minusBtn.addEventListener('click', function() {
        const currentValue = parseInt(qtyInput.value) || 1;
        if (currentValue > 1) {
            qtyInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', function() {
        const currentValue = parseInt(qtyInput.value) || 1;
        const maxValue = parseInt(qtyInput.max) || 999;
        if (currentValue < maxValue) {
            qtyInput.value = currentValue + 1;
        }
    });

    addToCartBtn.addEventListener('click', function() {
        const quantity = parseInt(qtyInput.value) || 1;
        addToCart(product.id, quantity);
    });

    return card;
}

function addToCart(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    updateCartDisplay();
    showNotification(`Добавлено в корзину: ${product.name}`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalAmount = document.querySelector('.total-amount');

    if (cartItems) {
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Корзина пуста</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toLocaleString()} сом/${item.unit}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="qty-btn minus" data-product-id="${item.id}">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="qty-input" data-product-id="${item.id}">
                            <button class="qty-btn plus" data-product-id="${item.id}">+</button>
                        </div>
                        <button class="remove-btn" data-product-id="${item.id}">×</button>
                    </div>
                `;

                // Add event listeners
                const minusBtn = cartItem.querySelector('.minus');
                const plusBtn = cartItem.querySelector('.plus');
                const qtyInput = cartItem.querySelector('.qty-input');
                const removeBtn = cartItem.querySelector('.remove-btn');

                minusBtn.addEventListener('click', function() {
                    updateCartQuantity(item.id, item.quantity - 1);
                });

                plusBtn.addEventListener('click', function() {
                    updateCartQuantity(item.id, item.quantity + 1);
                });

                qtyInput.addEventListener('change', function() {
                    updateCartQuantity(item.id, parseInt(this.value) || 1);
                });

                removeBtn.addEventListener('click', function() {
                    removeFromCart(item.id);
                });

                cartItems.appendChild(cartItem);
            });
        }
    }

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (totalAmount) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalAmount.textContent = `${total.toLocaleString()} сом`;
    }
}

function filterProducts() {
    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    const selectedSuppliers = Array.from(document.querySelectorAll('.filter-item input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.parentElement.textContent.trim());
    const maxPrice = parseInt(document.querySelector('.price-slider').value);

    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(product.supplier);
        const matchesPrice = product.price <= maxPrice;

        return matchesSearch && matchesSupplier && matchesPrice;
    });

    renderProducts();
    updateProductCount();
}

function filterByCategory(category) {
    if (category === 'Все товары') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }

    renderProducts();
    updateProductCount();
}

function sortProducts(sortBy) {
    switch (sortBy) {
        case 'По цене':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'По названию':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'По поставщику':
            filteredProducts.sort((a, b) => a.supplier.localeCompare(b.supplier));
            break;
    }

    renderProducts();
}

function switchView(view) {
    currentView = view;
    const productsGrid = document.getElementById('products-grid');
    
    if (view === 'list') {
        productsGrid.style.gridTemplateColumns = '1fr';
    } else {
        productsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    }
}

function updateProductCount() {
    const productCount = document.querySelector('.product-count');
    if (productCount) {
        productCount.textContent = `Найдено ${filteredProducts.length} товаров`;
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2a5298;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
