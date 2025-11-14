/**
 * API клиент для админ-панели
 */
import apiClient from './axiosConfig';
export const adminApi = {
    // Пользователи
    getUsers: async () => {
        const response = await apiClient.get(`/admin/users`);
        return response.data;
    },
    verifyUser: async (userId) => {
        const response = await apiClient.post(`/admin/users/${userId}/verify`);
        return response.data;
    },
    activateUser: async (userId) => {
        const response = await apiClient.post(`/admin/users/${userId}/activate`);
        return response.data;
    },
    deactivateUser: async (userId) => {
        const response = await apiClient.post(`/admin/users/${userId}/deactivate`);
        return response.data;
    },
    // Заявки
    getOrders: async () => {
        const response = await apiClient.get(`/admin/orders`);
        return response.data;
    },
    updateOrderStatus: async (orderId, data) => {
        const response = await apiClient.post(`/admin/orders/${orderId}/status`, data);
        return response.data;
    },
    // Товары
    getProducts: async (skip = 0, limit = 100) => {
        const response = await apiClient.get(`/admin/products`, {
            params: { skip, limit },
        });
        return response.data;
    },
    updateProduct: async (productId, data) => {
        const response = await apiClient.put(`/admin/products/${productId}`, data);
        return response.data;
    },
    bulkUpdatePrices: async (data) => {
        const response = await apiClient.post(`/admin/products/bulk-update-prices`, data);
        return response.data;
    },
    // Поставщики
    getSuppliers: async () => {
        const response = await apiClient.get(`/admin/suppliers`);
        return response.data;
    },
    createSupplier: async (data) => {
        const response = await apiClient.post(`/admin/suppliers`, data);
        return response.data;
    },
    updateSupplier: async (supplierId, data) => {
        const response = await apiClient.put(`/admin/suppliers/${supplierId}`, data);
        return response.data;
    },
    toggleSupplierActive: async (supplierId) => {
        const response = await apiClient.post(`/admin/suppliers/${supplierId}/toggle-active`);
        return response.data;
    },
    // Импорт прайс-листов
    importPriceList: async (file, supplierId, headerRow = 7, startRow = 8) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('supplier_id', supplierId.toString());
        formData.append('header_row', headerRow.toString());
        formData.append('start_row', startRow.toString());
        const response = await apiClient.post(`/admin/import-price-list`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    // Статистика
    getStats: async () => {
        const response = await apiClient.get(`/admin/stats`);
        return response.data;
    },
    // Пользователи на модерации
    getPendingUsers: async () => {
        const response = await apiClient.get(`/admin/users/pending`);
        return response.data;
    },
    // Отклонить пользователя
    rejectUser: async (userId, reason) => {
        const response = await apiClient.post(`/admin/users/${userId}/reject`, { reason: reason || null });
        return response.data;
    },
    // Статистика по заявкам
    getOrdersStats: async () => {
        const response = await apiClient.get(`/admin/orders/stats`);
        return response.data;
    },
    // Скачать и импортировать прайс-лист по URL
    downloadAndImportPriceList: async (supplierId, downloadUrl, frequency = 'manual', headerRow = 7, startRow = 8) => {
        const response = await apiClient.post(`/admin/price-lists/download-and-import`, {
            supplier_id: supplierId,
            download_url: downloadUrl,
            frequency,
            header_row: headerRow,
            start_row: startRow,
        });
        return response.data;
    },
    // Получить список автоматических обновлений прайс-листов
    getPriceListUpdates: async () => {
        const response = await apiClient.get(`/admin/price-lists/updates`);
        return response.data;
    },
    // Обновить настройки автоматического обновления
    updatePriceListUpdate: async (updateId, data) => {
        const response = await apiClient.put(`/admin/price-lists/updates/${updateId}`, data);
        return response.data;
    },
    // Запустить обновление прайс-листа вручную
    runPriceListUpdate: async (updateId) => {
        const response = await apiClient.post(`/admin/price-lists/updates/${updateId}/run`);
        return response.data;
    },
    // Получить информацию о прайс-листах всех поставщиков
    getSuppliersPriceLists: async () => {
        const response = await apiClient.get(`/admin/price-lists/suppliers`);
        return response.data;
    },
    getLastPriceListUpdate: async () => {
        const response = await apiClient.get(`/admin/price-lists/last-update`);
        return response.data;
    },
    downloadPriceListFile: async (updateId, filePath) => {
        let url = '';
        if (filePath && updateId === null) {
            // Скачиваем по пути (для временных файлов)
            url = `/admin/price-lists/files/download-by-path?file_path=${encodeURIComponent(filePath)}`;
        }
        else if (updateId !== null) {
            // Скачиваем по ID
            url = `/admin/price-lists/files/${updateId}/download`;
        }
        else {
            throw new Error('Не указан ID или путь к файлу');
        }
        const response = await apiClient.get(url, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });
        // Создаем ссылку для скачивания
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        // Получаем имя файла из заголовка или используем дефолтное
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'price_list.xlsx';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
    },
    getSupplierStats: async (supplierId) => {
        const response = await apiClient.get(`/admin/suppliers/${supplierId}/stats`);
        return response.data;
    },
    // Исправить constraint для frequency
    fixFrequencyConstraint: async () => {
        const response = await apiClient.post(`/admin/fix-frequency-constraint`);
        return response.data;
    },
};
