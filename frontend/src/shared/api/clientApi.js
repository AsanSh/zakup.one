/**
 * API клиент для клиентской части
 */
import apiClient from './axiosConfig';
export const clientApi = {
    // Товары
    searchProducts: async (query, limit = 20) => {
        const response = await apiClient.get(`/products/search`, {
            params: { q: query, limit },
        });
        return response.data;
    },
    getProduct: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    // Заявки
    getOrders: async () => {
        const response = await apiClient.get(`/orders`);
        return response.data;
    },
    createOrder: async (orderData) => {
        const response = await apiClient.post(`/orders`, orderData);
        return response.data;
    },
    // Отслеживание доставки
    getOrderTracking: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}/tracking`);
        return response.data;
    },
    // Активные доставки (со статусом shipped и выше)
    getActiveDeliveries: async () => {
        const response = await apiClient.get(`/orders/active-deliveries`);
        return response.data;
    },
};
