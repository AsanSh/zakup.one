import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { clientApi } from '../../shared/api';
import { formatDate } from '../../shared/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../shared/utils/constants';
import { Loader2, Package, Truck, MapPin, Calendar, CheckCircle } from 'lucide-react';
const deliveryStatusLabels = {
    pending: 'Ожидает отправки',
    shipped: 'Отправлена',
    in_transit: 'В пути',
    out_for_delivery: 'В доставке',
    delivered: 'Доставлена',
    failed: 'Не удалось доставить',
};
export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await clientApi.getOrders();
                setOrders(data);
            }
            catch (error) {
                console.error('Ошибка загрузки заявок:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);
    const fetchTracking = async (orderId) => {
        if (selectedOrder === orderId && tracking) {
            setSelectedOrder(null);
            setTracking(null);
            return;
        }
        setLoadingTracking(true);
        setSelectedOrder(orderId);
        try {
            const data = await clientApi.getOrderTracking(orderId);
            setTracking(data);
        }
        catch (error) {
            console.error('Ошибка загрузки отслеживания:', error);
            setTracking(null);
        }
        finally {
            setLoadingTracking(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    if (orders.length === 0) {
        return (_jsxs("div", { className: "max-w-4xl mx-auto text-center py-12", children: [_jsx(Package, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "\u0417\u0430\u044F\u0432\u043A\u0438 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043F\u0435\u0440\u0432\u0443\u044E \u0437\u0430\u044F\u0432\u043A\u0443 \u0438\u0437 \u043A\u043E\u0440\u0437\u0438\u043D\u044B" })] }));
    }
    return (_jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u041C\u043E\u0438 \u0437\u0430\u044F\u0432\u043A\u0438" }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u2116" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: orders.map((order) => (_jsxs(_Fragment, { children: [_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: ["#", order.id] }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: order.delivery_address }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.new}`, children: ORDER_STATUS_LABELS[order.status] || order.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(order.created_at) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsxs("button", { onClick: () => fetchTracking(order.id), className: "text-primary-600 hover:text-primary-800 flex items-center space-x-1", children: [_jsx(Truck, { className: "h-4 w-4" }), _jsx("span", { children: "\u041E\u0442\u0441\u043B\u0435\u0434\u0438\u0442\u044C" })] }) })] }, order.id), selectedOrder === order.id && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-4 bg-gray-50", children: loadingTracking ? (_jsx("div", { className: "flex justify-center py-4", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary-600" }) })) : tracking ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsx("span", { className: `inline-flex px-3 py-1 text-sm font-semibold rounded-full ${ORDER_STATUS_COLORS[tracking.status] || ORDER_STATUS_COLORS.new}`, children: deliveryStatusLabels[tracking.status] || tracking.status })] }), tracking.tracking_number && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(Package, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u041D\u043E\u043C\u0435\u0440 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F: ", _jsx("strong", { children: tracking.tracking_number })] })] })), tracking.carrier && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(Truck, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0447\u0438\u043A: ", _jsx("strong", { children: tracking.carrier })] })] })), tracking.current_location && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435: ", _jsx("strong", { children: tracking.current_location })] })] })), tracking.destination && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u041F\u0443\u043D\u043A\u0442 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F: ", _jsx("strong", { children: tracking.destination })] })] })), tracking.estimated_delivery_date && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u0430\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430: ", _jsx("strong", { children: formatDate(tracking.estimated_delivery_date) })] })] })), tracking.shipped_at && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-green-600", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E: ", formatDate(tracking.shipped_at)] })] })), tracking.delivered_at && (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-green-600", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E: ", formatDate(tracking.delivered_at)] })] })), tracking.events && tracking.events.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u043E\u0431\u044B\u0442\u0438\u0439:" }), _jsx("div", { className: "space-y-2", children: tracking.events.map((event) => (_jsx("div", { className: "flex items-start space-x-3 text-sm bg-white p-3 rounded border border-gray-200", children: _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-gray-900", children: deliveryStatusLabels[event.status] || event.status }), event.location && (_jsxs("div", { className: "text-gray-600 text-xs mt-1", children: [_jsx(MapPin, { className: "h-3 w-3 inline mr-1" }), event.location] })), event.description && (_jsx("div", { className: "text-gray-500 text-xs mt-1", children: event.description })), event.occurred_at && (_jsx("div", { className: "text-gray-400 text-xs mt-1", children: formatDate(event.occurred_at) }))] }) }, event.id))) })] }))] })) : (_jsx("div", { className: "text-center py-4 text-gray-500", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0431 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0438 \u043F\u043E\u043A\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430" })) }) }))] }))) })] }) })] }));
}
