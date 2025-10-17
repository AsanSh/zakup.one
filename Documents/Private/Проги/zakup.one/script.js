// Telegram WebApp initialization
let tg = window.Telegram.WebApp;

// Initialize the app
tg.ready();
tg.expand();

// Set theme colors
document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
document.body.style.color = tg.themeParams.text_color || '#000000';

// Cart state
let cart = {
    items: [
        { id: 1, name: 'Арматура А500С 8мм', price: 485, quantity: 2 },
        { id: 2, name: 'Двутавр 10Б1', price: 477, quantity: 1 },
        { id: 3, name: 'Двутавр 12Б1', price: 573, quantity: 1 },
        { id: 4, name: 'Двутавр 14Б1', price: 473, quantity: 1 }
    ]
};

// Current page
let currentPage = 'home';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateCartBadge();
});

function initializeApp() {
    // Set up Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        tg.MainButton.setText('Оформить заказ');
        tg.MainButton.hide();
        
        // Set up back button (only if supported)
        if (tg.BackButton && typeof tg.BackButton.onClick === 'function') {
            tg.BackButton.onClick(() => {
                if (currentPage !== 'home') {
                    showPage('home');
                } else {
                    tg.close();
                }
            });
        }
    }
    
    // Load saved settings
    loadSettings();
    
    // Load catalog products
    loadCatalogProducts();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize cart functionality
    initializeCart();
    
    // Show home page by default
    showPage('home');
}

function setupEventListeners() {
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            showPage(page);
        });
    });
    
    // Quantity controls
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isPlus = this.classList.contains('plus');
            const input = this.parentElement.querySelector('.qty-input');
            const currentValue = parseInt(input.value) || 0;
            const newValue = isPlus ? currentValue + 1 : Math.max(0, currentValue - 1);
            
            input.value = newValue;
            updateCart();
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const itemName = cartItem.querySelector('h4').textContent;
            
            // Remove from cart
            cart.items = cart.items.filter(item => item.name !== itemName);
            updateCartDisplay();
            updateCartBadge();
        });
    });
    
    // Order button
    const orderBtn = document.querySelector('.order-btn');
    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            placeOrder();
        });
    }
    
    // Request buttons
    document.querySelectorAll('.request-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleRequestAction(action);
        });
    });
    
    // Profile tabs
    document.querySelectorAll('.profile-tabs .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchProfileTab(tabName);
        });
    });
    
    // Profile options
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', function() {
            const option = this.querySelector('span').textContent;
            handleProfileOption(option);
        });
    });
    
    // Settings buttons
    document.querySelectorAll('.settings-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleSettingsAction(action);
        });
    });
    
    // Toggle switches
    document.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const setting = this.closest('.setting-item').querySelector('span').textContent;
            handleSettingChange(setting, this.checked);
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length > 0) {
                searchProducts(query);
            } else {
                // Очищаем результаты поиска
                clearSearchResults();
            }
        });
    }
    
    // Version switcher
    const versionSwitcher = document.getElementById('version-switcher');
    if (versionSwitcher) {
        versionSwitcher.addEventListener('click', function() {
            showVersionChoice();
        });
    }
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update current page
    currentPage = pageName;
    
    // Show/hide back button
    if (pageName === 'home') {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
    }
    
    // Show/hide main button
    if (pageName === 'cart' && cart.items.length > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
    
    // Update page content
    if (pageName === 'cart') {
        updateCartDisplay();
    }
}

function updateCart() {
    updateCartDisplay();
    updateCartBadge();
}

function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total span');
    
    if (!cartItemsContainer) return;
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    let total = 0;
    
    cart.items.forEach(item => {
        if (item.quantity > 0) {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>шт | ${item.price} сом</p>
                </div>
                <div class="item-controls">
                    <button class="qty-btn minus">-</button>
                    <input type="number" value="${item.quantity}" class="qty-input">
                    <button class="qty-btn plus">+</button>
                    <button class="remove-btn">×</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
            
            // Add event listeners to new buttons
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const removeBtn = cartItem.querySelector('.remove-btn');
            const qtyInput = cartItem.querySelector('.qty-input');
            
            minusBtn.addEventListener('click', () => {
                item.quantity = Math.max(0, item.quantity - 1);
                qtyInput.value = item.quantity;
                updateCart();
            });
            
            plusBtn.addEventListener('click', () => {
                item.quantity += 1;
                qtyInput.value = item.quantity;
                updateCart();
            });
            
            removeBtn.addEventListener('click', () => {
                item.quantity = 0;
                updateCart();
            });
        }
    });
    
    if (cartTotal) {
        cartTotal.textContent = `Итого: ${total.toLocaleString()} сом`;
    }
}

function updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge');
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function placeOrder() {
    if (cart.items.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
    }
    
    const orderData = {
        items: cart.items.filter(item => item.quantity > 0),
        total: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
    };
    
    // Send data to Telegram
    tg.sendData(JSON.stringify(orderData));
    
    // Show confirmation
    tg.showAlert('Заказ оформлен!');
    
    // Clear cart
    cart.items.forEach(item => item.quantity = 0);
    updateCart();
}

function handleRequestAction(action) {
    switch (action) {
        case 'Сфотографировать список':
            tg.showAlert('Функция фотографирования будет доступна в следующей версии');
            break;
        case 'Ввести вручную':
            tg.showAlert('Функция ручного ввода будет доступна в следующей версии');
            break;
        case 'Загрузить Excel':
            tg.showAlert('Функция загрузки Excel будет доступна в следующей версии');
            break;
    }
}

function switchProfileTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.profile-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(tabName + '-tab-content');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to selected tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

function handleProfileOption(option) {
    switch (option) {
        case 'Данные компании':
            tg.showAlert('Раздел "Данные компании" будет доступен в следующей версии');
            break;
        case 'Адреса':
            tg.showAlert('Раздел "Адреса" будет доступен в следующей версии');
            break;
        case 'Способы оплаты':
            tg.showAlert('Раздел "Способы оплаты" будет доступен в следующей версии');
            break;
        case 'Настройки лимита':
            tg.showAlert('Раздел "Настройки лимита" будет доступен в следующей версии');
            break;
    }
}

function handleSettingsAction(action) {
    switch (action) {
        case 'Сохранить настройки':
            tg.showAlert('Настройки сохранены!');
            break;
        case 'Сбросить к умолчанию':
            if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
                resetSettingsToDefault();
                tg.showAlert('Настройки сброшены к умолчанию');
            }
            break;
        case 'Выйти из аккаунта':
            if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                tg.showAlert('Выход из аккаунта выполнен');
                // Здесь можно добавить логику выхода
            }
            break;
    }
}

function handleSettingChange(setting, value) {
    console.log(`Setting changed: ${setting} = ${value}`);
    
    // Сохраняем настройку в localStorage
    localStorage.setItem(`setting_${setting}`, value);
    
    // Применяем настройки в реальном времени
    switch (setting) {
        case 'Темная тема':
            if (value) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            break;
        case 'Push-уведомления':
            if (value) {
                // Запрашиваем разрешение на уведомления
                if ('Notification' in window) {
                    Notification.requestPermission();
                }
            }
            break;
    }
}

function resetSettingsToDefault() {
    // Сбрасываем все переключатели к значениям по умолчанию
    const defaultSettings = {
        'Push-уведомления': true,
        'Уведомления о заказах': true,
        'Email уведомления': false,
        'Темная тема': false,
        'Автосохранение корзины': true,
        'Показывать цены с НДС': true,
        'Двухфакторная аутентификация': false,
        'Биометрическая авторизация': false
    };
    
    document.querySelectorAll('.toggle input').forEach(toggle => {
        const setting = toggle.closest('.setting-item').querySelector('span').textContent;
        toggle.checked = defaultSettings[setting] || false;
        handleSettingChange(setting, toggle.checked);
    });
}

function loadSettings() {
    // Загружаем сохраненные настройки
    document.querySelectorAll('.toggle input').forEach(toggle => {
        const setting = toggle.closest('.setting-item').querySelector('span').textContent;
        const savedValue = localStorage.getItem(`setting_${setting}`);
        if (savedValue !== null) {
            toggle.checked = savedValue === 'true';
            handleSettingChange(setting, toggle.checked);
        }
    });
}

function searchProducts(query) {
    console.log('Searching for:', query);
    
    // Получаем товары из demo-data.js
    const products = window.demoData?.products || [];
    
    // Фильтруем товары по запросу
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query)
    );
    
    // Показываем результаты поиска
    showSearchResults(filteredProducts, query);
}

function showSearchResults(products, query) {
    // Переключаемся на страницу каталога
    showPage('catalog');
    
    // Обновляем заголовок
    const catalogTitle = document.querySelector('#catalog-page h2');
    if (catalogTitle) {
        catalogTitle.textContent = `Результаты поиска: "${query}"`;
    }
    
    // Обновляем список товаров
    const productList = document.querySelector('.product-list');
    if (productList && products.length > 0) {
        productList.innerHTML = products.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <p class="product-supplier">${product.supplier}</p>
                </div>
                <div class="product-price">
                    <span class="price">${product.price} сом</span>
                    <span class="unit">за ${product.unit}</span>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <svg class="icon-svg" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
            </div>
        `).join('');
    } else if (productList) {
        productList.innerHTML = `
            <div class="no-results">
                <p>Товары не найдены</p>
                <p>Попробуйте изменить запрос</p>
            </div>
        `;
    }
    
    // Показываем уведомление
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert(`Найдено товаров: ${products.length}`);
    }
}

function clearSearchResults() {
    // Возвращаемся к обычному каталогу
    showPage('catalog');
    
    // Восстанавливаем заголовок
    const catalogTitle = document.querySelector('#catalog-page h2');
    if (catalogTitle) {
        catalogTitle.textContent = 'Арматура';
    }
    
    // Восстанавливаем обычный список товаров
    loadCatalogProducts();
}

function loadCatalogProducts() {
    // Получаем товары из demo-data.js
    const products = window.demoData?.products || [];
    
    // Показываем первые 6 товаров
    const displayProducts = products.slice(0, 6);
    
    const productList = document.querySelector('.product-list');
    if (productList) {
        productList.innerHTML = displayProducts.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <p class="product-supplier">${product.supplier}</p>
                </div>
                <div class="product-price">
                    <span class="price">${product.price} сом</span>
                    <span class="unit">за ${product.unit}</span>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <svg class="icon-svg" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length > 0) {
                searchProducts(query);
            } else {
                clearSearchResults();
            }
        });
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const category = this.value;
            if (category !== 'all') {
                filterByCategory(category);
            } else {
                clearSearchResults();
            }
        });
    }
}

function initializeCart() {
    const cartButton = document.getElementById('cart-button');
    const closeCart = document.getElementById('close-cart');
    
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.classList.add('open');
            }
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.classList.remove('open');
            }
        });
    }
}

function filterByCategory(category) {
    const products = window.demoData?.products || [];
    const filteredProducts = products.filter(product => product.category === category);
    
    showSearchResults(filteredProducts, category);
}

function showVersionChoice() {
    // Create version choice modal
    const modal = document.createElement('div');
    modal.className = 'device-choice-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Выберите версию приложения</h3>
                    <p>Переключитесь между мобильной и веб-версией</p>
                </div>
                <div class="modal-options">
                    <button class="version-btn telegram-btn" data-version="telegram">
                        <div class="btn-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <div class="btn-content">
                            <h4>Telegram App</h4>
                            <p>Мобильная версия для Telegram</p>
                        </div>
                    </button>
                    <button class="version-btn web-btn" data-version="web">
                        <div class="btn-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <div class="btn-content">
                            <h4>Веб версия</h4>
                            <p>Полнофункциональная версия для компьютера</p>
                        </div>
                    </button>
                </div>
                <div class="modal-footer">
                    <label class="remember-choice">
                        <input type="checkbox" id="remember-version-choice">
                        <span>Запомнить выбор</span>
                    </label>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelectorAll('.version-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const version = e.currentTarget.dataset.version;
            const remember = modal.querySelector('#remember-version-choice').checked;
            
            if (remember) {
                localStorage.setItem('zakup-preferred-version', version);
            }
            
            if (version === 'web') {
                window.location.href = '/web-version.html';
            } else if (version === 'telegram') {
                window.location.href = '/app.html';
            } else {
                // Stay on current page
                document.body.removeChild(modal);
            }
        });
    });

    // Close modal on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.body.removeChild(modal);
        }
    });
}

// Handle Telegram WebApp events
tg.onEvent('mainButtonClicked', function() {
    placeOrder();
});

tg.onEvent('backButtonClicked', function() {
    if (currentPage !== 'home') {
        showPage('home');
    } else {
        tg.close();
    }
});

// Utility functions
function formatPrice(price) {
    return price.toLocaleString() + ' сом';
}

function showNotification(message) {
    tg.showAlert(message);
}

// Export for potential use in other scripts
window.ZakupApp = {
    showPage,
    updateCart,
    placeOrder,
    cart
};
