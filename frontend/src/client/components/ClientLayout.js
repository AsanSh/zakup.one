import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Layout для клиентской части
 */
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, Search, FileText, LogOut, User, LayoutDashboard, MapPin } from 'lucide-react';
export default function ClientLayout() {
    const location = useLocation();
    const { logout, user } = useAuthStore();
    const { getItemCount } = useCartStore();
    const cartItemCount = getItemCount();
    const navigation = [
        { name: 'Товары', href: '/search', icon: Search },
        { name: 'Сборка заявки', href: '/cart', icon: ShoppingCart, badge: cartItemCount },
        { name: 'Мои заявки', href: '/orders', icon: FileText },
        { name: 'Статус', href: '/delivery-status', icon: MapPin },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx(Link, { to: "/", className: "text-2xl font-bold text-primary-600", children: "ZAKUP.ONE" }) }), _jsx("nav", { className: "flex space-x-8", children: navigation.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.href;
                                    return (_jsxs(Link, { to: item.href, className: `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { children: item.name }), item.badge !== undefined && item.badge > 0 && (_jsx("span", { className: "bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1", children: item.badge }))] }, item.name));
                                }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [user?.is_admin && (_jsxs(Link, { to: "/admin", className: "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors border border-gray-200", title: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0432 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C", children: [_jsx(LayoutDashboard, { className: "h-5 w-5" }), _jsx("span", { children: "\u0410\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C" })] })), _jsxs(Link, { to: "/profile", className: `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/profile'
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`, children: [_jsx(User, { className: "h-5 w-5" }), _jsx("span", { children: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" })] }), _jsxs("button", { onClick: logout, className: "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors", children: [_jsx(LogOut, { className: "h-5 w-5" }), _jsx("span", { children: "\u0412\u044B\u0445\u043E\u0434" })] })] })] }) }) }), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsx(Outlet, {}) })] }));
}
