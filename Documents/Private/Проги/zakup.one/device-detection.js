// Device Detection and Auto-Redirect System
class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.isTelegram = this.detectTelegram();
        this.deviceType = this.detectDevice();
        this.preferredVersion = this.getPreferredVersion();
    }

    // Detect if user is in Telegram WebApp
    detectTelegram() {
        return !!(window.Telegram && window.Telegram.WebApp);
    }

    // Detect device type based on multiple factors
    detectDevice() {
        // Check for mobile user agents
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isMobileUA = mobileRegex.test(this.userAgent);
        
        // Check for tablet specifically
        const isTablet = /iPad|Android(?=.*Mobile)/i.test(this.userAgent);
        
        // Check screen size
        const isSmallScreen = this.screenWidth <= 768;
        const isMediumScreen = this.screenWidth <= 1024;
        
        // Check for touch capability
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Determine device type
        if (isTablet) {
            return 'tablet';
        } else if (isMobileUA || (isSmallScreen && hasTouch)) {
            return 'mobile';
        } else if (isMediumScreen && hasTouch) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    // Get user's preferred version from localStorage
    getPreferredVersion() {
        return localStorage.getItem('zakup-preferred-version') || 'auto';
    }

    // Set user's preferred version
    setPreferredVersion(version) {
        localStorage.setItem('zakup-preferred-version', version);
    }

    // Get recommended version for current device
    getRecommendedVersion() {
        if (this.isTelegram) {
            return 'telegram';
        }
        
        switch (this.deviceType) {
            case 'mobile':
                return 'mobile';
            case 'tablet':
                return 'web';
            case 'desktop':
                return 'web';
            default:
                return 'web';
        }
    }

    // Check if redirect is needed
    shouldRedirect() {
        const currentPath = window.location.pathname;
        const recommendedVersion = this.getRecommendedVersion();
        
        // Don't redirect if user has explicitly chosen a version
        if (this.preferredVersion !== 'auto') {
            return false;
        }
        
        // Don't redirect if already on correct version
        if (currentPath.includes('web-version') && recommendedVersion === 'web') {
            return false;
        }
        
        if (currentPath === '/' && (recommendedVersion === 'telegram' || recommendedVersion === 'mobile')) {
            return false;
        }
        
        return true;
    }

    // Perform automatic redirect
    redirect() {
        const recommendedVersion = this.getRecommendedVersion();
        
        switch (recommendedVersion) {
            case 'web':
                if (!window.location.pathname.includes('web-version')) {
                    window.location.href = '/web-version.html';
                }
                break;
            case 'telegram':
            case 'mobile':
                if (window.location.pathname.includes('web-version')) {
                    window.location.href = '/';
                }
                break;
        }
    }

    // Show device choice modal for mobile users
    showDeviceChoice() {
        if (this.deviceType !== 'mobile' || this.isTelegram) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'device-choice-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Выберите версию приложения</h3>
                        <p>Мы определили, что вы используете мобильное устройство</p>
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
                                <p>Полнофункциональная версия</p>
                            </div>
                        </button>
                    </div>
                    <div class="modal-footer">
                        <label class="remember-choice">
                            <input type="checkbox" id="remember-choice">
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
                const remember = modal.querySelector('#remember-choice').checked;
                
                if (remember) {
                    this.setPreferredVersion(version);
                }
                
                this.redirectToVersion(version);
                document.body.removeChild(modal);
            });
        });
    }

    // Redirect to specific version
    redirectToVersion(version) {
        switch (version) {
            case 'telegram':
                window.location.href = '/app.html';
                break;
            case 'web':
                window.location.href = '/web-version.html';
                break;
            default:
                break;
        }
    }

    // Initialize device detection and redirect
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.handleDetection());
        } else {
            this.handleDetection();
        }
    }

    // Handle device detection logic
    handleDetection() {
        const currentPath = window.location.pathname;
        
        // If user has a preferred version and it's not auto, respect it
        if (this.preferredVersion !== 'auto') {
            this.redirectToVersion(this.preferredVersion);
            return;
        }

        // If in Telegram, redirect to app version
        if (this.isTelegram) {
            if (!currentPath.includes('app.html')) {
                window.location.href = '/app.html';
            }
            return;
        }

        // If on app.html but not in Telegram, redirect to main page
        if (currentPath.includes('app.html') && !this.isTelegram) {
            window.location.href = '/';
            return;
        }

        // If on main page, stay there (don't redirect) - NO REDIRECTS FROM MAIN PAGE
        if (currentPath === '/' || currentPath === '/index.html') {
            return; // Stay on main page - NO REDIRECTS
        }

        // For any other page, stay there
        return;
    }

    // Get device info for debugging
    getDeviceInfo() {
        return {
            userAgent: this.userAgent,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            deviceType: this.deviceType,
            isTelegram: this.isTelegram,
            preferredVersion: this.preferredVersion,
            recommendedVersion: this.getRecommendedVersion()
        };
    }
}

// Initialize device detection
const deviceDetector = new DeviceDetector();
deviceDetector.init();

// Export for debugging
window.DeviceDetector = deviceDetector;
