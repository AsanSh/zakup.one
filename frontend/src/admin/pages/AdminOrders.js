import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/api';
import { Loader2 } from 'lucide-react';
const statusLabels = {
    new: 'Новая',
    in_progress: 'В обработке',
    collected: 'Собрана',
    shipped: 'Отправлена',
    in_transit: 'В пути',
    delivered: 'Доставлена',
    cancelled: 'Отменена',
};
const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    collected: 'bg-green-100 text-green-800',
    shipped: 'bg-purple-100 text-purple-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};
export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusForm, setStatusForm] = useState({
        status: '',
        tracking_number: '',
        estimated_delivery_date: '',
    });
    useEffect(() => {
        fetchOrders();
    }, []);
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getOrders();
            setOrders(data);
        }
        catch (err) {
            console.error('Ошибка загрузки заявок:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleStatusUpdate = async (orderId) => {
        try {
            await adminApi.updateOrderStatus(orderId, {
                status: statusForm.status,
                tracking_number: statusForm.tracking_number || undefined,
                estimated_delivery_date: statusForm.estimated_delivery_date || undefined,
            });
            setSelectedOrder(null);
            setStatusForm({ status: '', tracking_number: '', estimated_delivery_date: '' });
            fetchOrders();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка обновления статуса');
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u0417\u0430\u044F\u0432\u043A\u0438" }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u2116" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u041A\u043B\u0438\u0435\u043D\u0442" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0410\u0434\u0440\u0435\u0441" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0414\u0430\u0442\u0430" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: orders.map((order) => (_jsxs(_Fragment, { children: [_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: ["#", order.id] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: _jsxs("div", { children: [_jsx("div", { children: order.user_name }), _jsx("div", { className: "text-xs text-gray-500", children: order.user_email })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: order.delivery_address }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status] || statusColors.new}`, children: statusLabels[order.status] || order.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(order.created_at) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsx("button", { onClick: () => {
                                                        setSelectedOrder(order.id);
                                                        setStatusForm({
                                                            status: order.status,
                                                            tracking_number: order.tracking_number || '',
                                                            estimated_delivery_date: order.estimated_delivery_date
                                                                ? new Date(order.estimated_delivery_date).toISOString().split('T')[0]
                                                                : '',
                                                        });
                                                    }, className: "text-primary-600 hover:text-primary-800", children: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441" }) })] }, order.id), selectedOrder === order.id && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-6 py-4 bg-gray-50", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0437\u0430\u043A\u0430\u0437\u0430 #", order.id] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsxs("select", { value: statusForm.status, onChange: (e) => setStatusForm({ ...statusForm, status: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "new", children: "\u041D\u043E\u0432\u0430\u044F" }), _jsx("option", { value: "in_progress", children: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435" }), _jsx("option", { value: "collected", children: "\u0421\u043E\u0431\u0440\u0430\u043D\u0430" }), _jsx("option", { value: "shipped", children: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430" }), _jsx("option", { value: "in_transit", children: "\u0412 \u043F\u0443\u0442\u0438" }), _jsx("option", { value: "delivered", children: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430" }), _jsx("option", { value: "cancelled", children: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u0430" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041D\u043E\u043C\u0435\u0440 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F" }), _jsx("input", { type: "text", value: statusForm.tracking_number, onChange: (e) => setStatusForm({ ...statusForm, tracking_number: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: "TRACK123456" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsx("input", { type: "date", value: statusForm.estimated_delivery_date, onChange: (e) => setStatusForm({ ...statusForm, estimated_delivery_date: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleStatusUpdate(order.id), className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" }), _jsx("button", { onClick: () => {
                                                                    setSelectedOrder(null);
                                                                    setStatusForm({ status: '', tracking_number: '', estimated_delivery_date: '' });
                                                                }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] }) }) }))] }))) })] }) })] }));
}
