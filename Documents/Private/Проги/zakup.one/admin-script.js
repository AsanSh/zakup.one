// Admin Panel JavaScript
let currentSection = 'dashboard';
let suppliers = [];
let products = [];
let orders = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
    loadDashboardData();
});

function initializeAdmin() {
    // Load demo data
    if (window.demoData) {
        suppliers = window.demoData.suppliers || [];
        products = window.demoData.products || [];
        orders = window.demoData.orders || [];
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // File upload
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    if (uploadZone) {
        uploadZone.addEventListener('click', function() {
            fileInput.click();
        });

        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#2a5298';
            this.style.background = '#f8f9fa';
        });

        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = 'white';
        });

        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = 'white';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFileUpload(this.files[0]);
            }
        });
    }

    // Markup controls
    const markupInputs = document.querySelectorAll('.markup-item input');
    markupInputs.forEach(input => {
        input.addEventListener('input', function() {
            updatePricePreview();
        });
    });

    // Apply markup button
    const applyMarkupBtn = document.querySelector('.admin-btn.primary');
    if (applyMarkupBtn && applyMarkupBtn.textContent.includes('Применить наценки')) {
        applyMarkupBtn.addEventListener('click', function() {
            applyMarkups();
        });
    }
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'suppliers':
            loadSuppliersData();
            break;
        case 'prices':
            loadPricesData();
            break;
        case 'upload':
            loadUploadData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'tracking':
            loadTrackingData();
            break;
    }
}

function loadDashboardData() {
    // Update stats
    updateStats();
}

function loadSuppliersData() {
    // Load suppliers table data
    console.log('Loading suppliers data...');
}

function loadPricesData() {
    // Load price management data
    updatePricePreview();
}

function loadUploadData() {
    // Load upload history
    console.log('Loading upload data...');
}

function loadOrdersData() {
    // Load orders data
    console.log('Loading orders data...');
}

function loadTrackingData() {
    // Load tracking data
    console.log('Loading tracking data...');
}

function updateStats() {
    // Update dashboard statistics
    const stats = {
        suppliers: suppliers.length || 12,
        products: products.length || 1247,
        orders: orders.length || 156,
        revenue: 2450000
    };

    // Update stat cards
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 4) {
        statNumbers[0].textContent = stats.suppliers;
        statNumbers[1].textContent = stats.products.toLocaleString();
        statNumbers[2].textContent = stats.orders;
        statNumbers[3].textContent = stats.revenue.toLocaleString();
    }
}

function handleFileUpload(file) {
    if (!file) return;

    const fileName = file.name;
    const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB

    // Show upload progress
    showNotification(`Загружается файл: ${fileName} (${fileSize} MB)`);

    // Simulate file processing
    setTimeout(() => {
        processPriceList(file);
    }, 2000);
}

function processPriceList(file) {
    // Simulate price list processing
    const mockResults = {
        totalRows: 245,
        processedRows: 240,
        errors: 5,
        newProducts: 15,
        updatedProducts: 225
    };

    showNotification(`Обработка завершена: ${mockResults.processedRows} товаров обработано, ${mockResults.newProducts} новых товаров добавлено`);
    
    // Add to upload history
    addToUploadHistory(file.name);
}

function addToUploadHistory(fileName) {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-info">
            <div class="history-name">${fileName}</div>
            <div class="history-date">${new Date().toLocaleString()}</div>
        </div>
        <div class="history-status success">Успешно</div>
        <div class="history-actions">
            <button class="btn-sm secondary">Скачать</button>
        </div>
    `;

    historyList.insertBefore(historyItem, historyList.firstChild);
}

function updatePricePreview() {
    // Get markup values
    const generalMarkup = document.querySelector('.markup-form input[type="number"]')?.value || 15;
    const categoryMarkups = {};
    
    document.querySelectorAll('.markup-item').forEach(item => {
        const category = item.querySelector('span:first-child').textContent;
        const markup = item.querySelector('input').value || 0;
        categoryMarkups[category] = parseInt(markup);
    });

    // Update price preview table
    const priceTable = document.querySelector('.price-table tbody');
    if (priceTable) {
        priceTable.innerHTML = `
            <tr>
                <td>Арматура А500С 8мм</td>
                <td>СтройДвор</td>
                <td>485 сом</td>
                <td>${categoryMarkups['Арматура'] || generalMarkup}%</td>
                <td>${Math.round(485 * (1 + (categoryMarkups['Арматура'] || generalMarkup) / 100))} сом</td>
            </tr>
            <tr>
                <td>Двутавр 10Б1</td>
                <td>МеталлСтрой</td>
                <td>477 сом</td>
                <td>${categoryMarkups['Двутавры'] || generalMarkup}%</td>
                <td>${Math.round(477 * (1 + (categoryMarkups['Двутавры'] || generalMarkup) / 100))} сом</td>
            </tr>
        `;
    }
}

function applyMarkups() {
    const generalMarkup = document.querySelector('.markup-form input[type="number"]')?.value || 15;
    
    showNotification(`Наценки применены: общая наценка ${generalMarkup}%`);
    
    // Here you would typically send data to server
    console.log('Applying markups:', {
        generalMarkup: generalMarkup,
        categoryMarkups: getCategoryMarkups()
    });
}

function getCategoryMarkups() {
    const markups = {};
    document.querySelectorAll('.markup-item').forEach(item => {
        const category = item.querySelector('span:first-child').textContent;
        const markup = item.querySelector('input').value || 0;
        markups[category] = parseInt(markup);
    });
    return markups;
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
        max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
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

// Export functions for potential use
window.AdminPanel = {
    switchSection,
    handleFileUpload,
    applyMarkups,
    showNotification
};
