import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/api';
import { Loader2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
export default function AdminPriceManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bulkAction, setBulkAction] = useState({
        type: 'percent',
        value: '',
        category: '',
        supplier_id: '',
    });
    const [suppliers, setSuppliers] = useState([]);
    useEffect(() => {
        fetchSuppliers();
    }, []);
    const fetchSuppliers = async () => {
        try {
            const data = await adminApi.getSuppliers();
            setSuppliers(data);
        }
        catch (err) {
            console.error('Ошибка загрузки поставщиков:', err);
        }
    };
    useEffect(() => {
        fetchProducts();
    }, []);
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getProducts(0, 500);
            setProducts(data);
        }
        catch (err) {
            console.error('Ошибка загрузки товаров:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleBulkUpdate = async () => {
        if (!bulkAction.value) {
            alert('Введите значение для изменения цен');
            return;
        }
        try {
            const result = await adminApi.bulkUpdatePrices({
                type: bulkAction.type,
                value: parseFloat(bulkAction.value),
                category: bulkAction.category || undefined,
                supplier_id: bulkAction.supplier_id ? parseInt(bulkAction.supplier_id) : undefined,
            });
            alert(`Успешно обновлено цен: ${result.updated_count}`);
            setBulkAction({ type: 'percent', value: '', category: '', supplier_id: '' });
            fetchProducts();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка обновления цен');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0446\u0435\u043D\u0430\u043C\u0438" }), _jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-2 text-primary-600" }), "\u041C\u0430\u0441\u0441\u043E\u0432\u043E\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0446\u0435\u043D"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0422\u0438\u043F \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" }), _jsxs("select", { value: bulkAction.type, onChange: (e) => setBulkAction({ ...bulkAction, type: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "percent", children: "\u041F\u0440\u043E\u0446\u0435\u043D\u0442 (%)" }), _jsx("option", { value: "fixed", children: "\u0424\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430 (\u0441\u043E\u043C)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: bulkAction.type === 'percent' ? 'Процент изменения' : 'Сумма изменения' }), _jsx("input", { type: "number", value: bulkAction.value, onChange: (e) => setBulkAction({ ...bulkAction, value: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: bulkAction.type === 'percent' ? '10' : '100', step: bulkAction.type === 'percent' ? '0.1' : '0.01' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)" }), _jsx("input", { type: "text", value: bulkAction.category, onChange: (e) => setBulkAction({ ...bulkAction, category: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)" }), _jsxs("select", { value: bulkAction.supplier_id, onChange: (e) => setBulkAction({ ...bulkAction, supplier_id: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "\u0412\u0441\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0438" }), suppliers.map((supplier) => (_jsx("option", { value: supplier.id, children: supplier.name }, supplier.id)))] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: handleBulkUpdate, className: "w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C" }) })] }), _jsxs("div", { className: "mt-4 text-sm text-gray-500", children: [_jsx("p", { children: "\u041F\u0440\u0438\u043C\u0435\u0440\u044B:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1", children: [_jsx("li", { children: "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C \u0432\u0441\u0435 \u0446\u0435\u043D\u044B \u043D\u0430 10%: \u0422\u0438\u043F \"\u041F\u0440\u043E\u0446\u0435\u043D\u0442\", \u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \"10\"" }), _jsx("li", { children: "\u0423\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C \u0432\u0441\u0435 \u0446\u0435\u043D\u044B \u043D\u0430 5%: \u0422\u0438\u043F \"\u041F\u0440\u043E\u0446\u0435\u043D\u0442\", \u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \"-5\"" }), _jsx("li", { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C 100 \u0441\u043E\u043C \u043A\u043E \u0432\u0441\u0435\u043C \u0446\u0435\u043D\u0430\u043C: \u0422\u0438\u043F \"\u0424\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430\", \u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \"100\"" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsx("div", { className: "bg-white shadow rounded-lg p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u0446\u0435\u043D\u0430" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: products.length > 0
                                                ? new Intl.NumberFormat('ru-RU', {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                }).format(products.reduce((sum, p) => sum + p.price, 0) / products.length) + ' сом'
                                                : '-' })] }), _jsx(DollarSign, { className: "h-8 w-8 text-primary-600" })] }) }), _jsx("div", { className: "bg-white shadow rounded-lg p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0446\u0435\u043D\u0430" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: products.length > 0
                                                ? new Intl.NumberFormat('ru-RU', {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                }).format(Math.min(...products.map((p) => p.price))) + ' сом'
                                                : '-' })] }), _jsx(TrendingDown, { className: "h-8 w-8 text-green-600" })] }) }), _jsx("div", { className: "bg-white shadow rounded-lg p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0446\u0435\u043D\u0430" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: products.length > 0
                                                ? new Intl.NumberFormat('ru-RU', {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                }).format(Math.max(...products.map((p) => p.price))) + ' сом'
                                                : '-' })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-red-600" })] }) })] })] }));
}
