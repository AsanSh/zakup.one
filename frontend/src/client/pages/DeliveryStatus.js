import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { clientApi } from '../../shared/api';
import { formatDate } from '../../shared/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../shared/utils/constants';
import { Loader2, Package, Truck, MapPin, CheckCircle, Clock, Navigation } from 'lucide-react';
const deliveryStatusLabels = {
    pending: 'Ожидает отправки',
    shipped: 'Отправлена',
    in_transit: 'В пути',
    out_for_delivery: 'В доставке',
    delivered: 'Доставлена',
    failed: 'Не удалось доставить',
};
export default function DeliveryStatus() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    useEffect(() => {
        fetchActiveDeliveries();
        // Обновляем каждые 30 секунд для отслеживания в реальном времени
        const interval = setInterval(fetchActiveDeliveries, 30000);
        return () => clearInterval(interval);
    }, []);
    const fetchActiveDeliveries = async () => {
        try {
            setLoading(true);
            const data = await clientApi.getActiveDeliveries();
            setOrders(data);
        }
        catch (error) {
            console.error('Ошибка загрузки доставок:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        // Формула гаверсинуса для расчета расстояния между двумя точками
        const R = 6371; // Радиус Земли в км
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    const calculateETA = (distance, avgSpeed = 50) => {
        // Средняя скорость 50 км/ч в городе
        const hours = distance / avgSpeed;
        if (hours < 1) {
            return `${Math.round(hours * 60)} минут`;
        }
        return `${Math.round(hours * 10) / 10} часов`;
    };
    if (loading && orders.length === 0) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    if (orders.length === 0) {
        return (_jsxs("div", { className: "max-w-4xl mx-auto text-center py-12", children: [_jsx(Package, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0434\u043E\u0441\u0442\u0430\u0432\u043E\u043A" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u0417\u0430\u043A\u0430\u0437\u044B, \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0435 \u043D\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0443, \u0431\u0443\u0434\u0443\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C\u0441\u044F \u0437\u0434\u0435\u0441\u044C" })] }));
    }
    return (_jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438" })] }), _jsx("div", { className: "space-y-6", children: orders.map((order) => {
                    const tracking = order.tracking;
                    const driverLocation = order.driver_location;
                    const isSelected = selectedOrder === order.id;
                    // Расчет расстояния и времени прибытия (если есть геолокация)
                    let distance = null;
                    let eta = null;
                    if (driverLocation && tracking?.destination) {
                        // В реальном приложении нужно получить координаты адреса доставки
                        // Здесь используем примерные координаты
                        const destLat = 42.8746; // Пример координат Бишкека
                        const destLon = 74.5698;
                        distance = calculateDistance(driverLocation.latitude, driverLocation.longitude, destLat, destLon);
                        eta = calculateETA(distance);
                    }
                    return (_jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden border border-gray-200", children: [_jsx("div", { className: "p-6 cursor-pointer hover:bg-gray-50 transition-colors", onClick: () => setSelectedOrder(isSelected ? null : order.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Package, { className: "h-8 w-8 text-primary-600" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["\u0417\u0430\u043A\u0430\u0437 #", order.id] }), _jsx("span", { className: `inline-flex px-3 py-1 text-xs font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.new}`, children: ORDER_STATUS_LABELS[order.status] || order.status }), tracking && (_jsx("span", { className: `inline-flex px-3 py-1 text-xs font-semibold rounded-full ${tracking.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                            tracking.status === 'in_transit' || tracking.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                                                                                'bg-yellow-100 text-yellow-800'}`, children: deliveryStatusLabels[tracking.status] || tracking.status }))] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [_jsx(MapPin, { className: "h-4 w-4 inline mr-1" }), order.delivery_address] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["\u0421\u043E\u0437\u0434\u0430\u043D: ", formatDate(order.created_at)] })] })] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [driverLocation && (_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-1 text-sm text-gray-600", children: [_jsx(Navigation, { className: "h-4 w-4 text-primary-600" }), _jsx("span", { className: "font-medium", children: "\u0412 \u043F\u0443\u0442\u0438" })] }), distance !== null && (_jsxs("div", { className: "text-xs text-gray-500", children: [distance.toFixed(1), " \u043A\u043C"] })), eta && (_jsxs("div", { className: "text-xs text-primary-600 font-medium", children: ["~", eta] }))] })), tracking?.estimated_delivery_date && !driverLocation && (_jsx("div", { className: "text-right", children: _jsxs("div", { className: "flex items-center space-x-1 text-sm text-gray-600", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsxs("span", { children: ["\u041E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F: ", formatDate(tracking.estimated_delivery_date)] })] }) }))] })] }) }), isSelected && tracking && (_jsx("div", { className: "border-t border-gray-200 bg-gray-50 p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [tracking.tracking_number && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "\u041D\u043E\u043C\u0435\u0440 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: tracking.tracking_number })] })), tracking.carrier && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "\u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0447\u0438\u043A" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: tracking.carrier })] })), tracking.current_location && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }), _jsxs("p", { className: "text-sm font-medium text-gray-900 flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 mr-1 text-primary-600" }), tracking.current_location] })] })), tracking.destination && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "\u041F\u0443\u043D\u043A\u0442 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F" }), _jsxs("p", { className: "text-sm font-medium text-gray-900 flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 mr-1 text-green-600" }), tracking.destination] })] }))] }), driverLocation && (_jsxs("div", { className: "bg-white rounded-lg p-4 border border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(Navigation, { className: "h-5 w-5 text-primary-600" }), _jsx("h4", { className: "font-semibold text-gray-900", children: "\u041C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-gray-600", children: ["\u0428\u0438\u0440\u043E\u0442\u0430: ", driverLocation.latitude.toFixed(6)] }), _jsxs("p", { className: "text-gray-600", children: ["\u0414\u043E\u043B\u0433\u043E\u0442\u0430: ", driverLocation.longitude.toFixed(6)] })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-gray-600", children: ["\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ", formatDate(driverLocation.last_updated)] }), distance !== null && (_jsxs("p", { className: "text-primary-600 font-medium", children: ["\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435: ", distance.toFixed(1), " \u043A\u043C"] })), eta && (_jsxs("p", { className: "text-primary-600 font-medium", children: ["\u041F\u0440\u0438\u043C\u0435\u0440\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F: ~", eta] }))] })] }), _jsx("div", { className: "mt-4 bg-gray-100 rounded h-48 flex items-center justify-center", children: _jsx("p", { className: "text-gray-500 text-sm", children: "\u041A\u0430\u0440\u0442\u0430 \u0441 \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u043C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F" }) })] })), tracking.events && tracking.events.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-3", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u043E\u0431\u044B\u0442\u0438\u0439" }), _jsx("div", { className: "space-y-2", children: tracking.events.map((event) => (_jsxs("div", { className: "flex items-start space-x-3 bg-white p-3 rounded border border-gray-200", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: event.status === 'delivered' ? (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })) : event.status === 'in_transit' || event.status === 'out_for_delivery' ? (_jsx(Truck, { className: "h-5 w-5 text-blue-600" })) : (_jsx(Clock, { className: "h-5 w-5 text-yellow-600" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-gray-900", children: deliveryStatusLabels[event.status] || event.status }), event.location && (_jsxs("div", { className: "text-gray-600 text-sm mt-1 flex items-center", children: [_jsx(MapPin, { className: "h-3 w-3 mr-1" }), event.location] })), event.description && (_jsx("div", { className: "text-gray-500 text-sm mt-1", children: event.description })), event.occurred_at && (_jsx("div", { className: "text-gray-400 text-xs mt-1", children: formatDate(event.occurred_at) }))] })] }, event.id))) })] })), order.status === 'delivered' && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), _jsx("p", { className: "text-green-800 font-medium", children: "\u0417\u0430\u043A\u0430\u0437 \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D \u0438 \u043F\u0440\u0438\u043D\u044F\u0442 \u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0446\u0435\u043C" })] }), tracking.delivered_at && (_jsxs("p", { className: "text-green-700 text-sm mt-1", children: ["\u0414\u0430\u0442\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438: ", formatDate(tracking.delivered_at)] }))] }))] }) }))] }, order.id));
                }) })] }));
}
