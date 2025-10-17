// Simple API for product search
class ProductAPI {
    constructor() {
        this.products = window.demoData?.products || [];
    }

    // Search products with filters
    searchProducts(search = "", category = "") {
        let filteredProducts = [...this.products];
        
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
        if (category && category !== "all") {
            filteredProducts = filteredProducts.filter(product => 
                product.category === category
            );
        }
        
        return filteredProducts;
    }

    // Get all categories
    getCategories() {
        const categories = [...new Set(this.products.map(p => p.category))];
        return categories.sort();
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    // Get products by supplier
    getProductsBySupplier(supplier) {
        return this.products.filter(p => p.supplier === supplier);
    }

    // Simulate API delay
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Async search method
    async searchProductsAsync(search = "", category = "") {
        await this.delay(300); // Simulate network delay
        return this.searchProducts(search, category);
    }
}

// Create global API instance
window.ProductAPI = new ProductAPI();

// Mock API endpoints for compatibility
window.api = {
    products: {
        search: async (params) => {
            const { search = "", category = "" } = params;
            const results = window.ProductAPI.searchProducts(search, category);
            return { data: results };
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductAPI;
}
