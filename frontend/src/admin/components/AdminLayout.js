import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Layout для админ-панели с сайдбаром
 */
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, Menu, X, Building2, Store, UsersRound, Truck, Settings, Tag, Calendar, DollarSign, Shield, } from 'lucide-react';
import { useState, useEffect } from 'react';
const adminNavigation = [
    { name: 'Панель управления', href: '/admin', icon: LayoutDashboard },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
    { name: 'Заявки', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Товары', href: '/admin/products', icon: Package },
    {
        name: 'Контрагенты',
        href: '/admin/counterparties',
        icon: UsersRound,
        submenu: [
            { name: 'Поставщики', href: '/admin/counterparties/suppliers', icon: Building2 },
            { name: 'Снабженцы', href: '/admin/counterparties/procurement', icon: Users },
            { name: 'Водители', href: '/admin/counterparties/drivers', icon: Truck },
            { name: 'Управление доступом', href: '/admin/counterparties/access', icon: Shield },
        ]
    },
    {
        name: 'Управление',
        href: '/admin/management',
        icon: Settings,
        submenu: [
            { name: 'Обновление прайс-листов', href: '/admin/management/price-lists', icon: Calendar },
            { name: 'Управление ценами', href: '/admin/management/prices', icon: DollarSign },
            { name: 'Управление товарами', href: '/admin/management/products', icon: Tag },
        ]
    },
];
export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState(new Set());
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const toggleSubmenu = (menuName) => {
        const newExpanded = new Set(expandedMenus);
        if (newExpanded.has(menuName)) {
            newExpanded.delete(menuName);
        }
        else {
            newExpanded.add(menuName);
        }
        setExpandedMenus(newExpanded);
    };
    const isSubmenuActive = (submenu) => {
        if (!submenu)
            return false;
        return submenu.some(item => {
            if (location.pathname === item.href)
                return true;
            if (location.pathname.startsWith(item.href + '/'))
                return true;
            return false;
        });
    };
    // Автоматически раскрываем подменю, если активен один из его пунктов
    useEffect(() => {
        const newExpanded = new Set();
        adminNavigation.forEach(item => {
            if (item.submenu && isSubmenuActive(item.submenu)) {
                newExpanded.add(item.name);
            }
        });
        if (newExpanded.size > 0) {
            setExpandedMenus(prev => {
                const merged = new Set(prev);
                newExpanded.forEach(name => merged.add(name));
                return merged;
            });
        }
    }, [location.pathname]);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden", onClick: () => setSidebarOpen(false) })), _jsx("aside", { className: `fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`, children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-gray-200", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "\u041C\u0435\u043D\u044E" }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "lg:hidden text-gray-500 hover:text-gray-700", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsx("nav", { className: "flex-1 px-4 py-6 space-y-2 overflow-y-auto", children: adminNavigation.map((item) => {
                                const Icon = item.icon;
                                const hasSubmenu = !!item.submenu;
                                const isSubmenuExpanded = expandedMenus.has(item.name);
                                const isSubmenuItemActive = hasSubmenu && isSubmenuActive(item.submenu);
                                // Определяем активный пункт меню: проверяем пути от самого длинного к самому короткому
                                // Сортируем навигацию по длине пути (от длинного к короткому)
                                const sortedNav = [...adminNavigation].sort((a, b) => b.href.length - a.href.length);
                                // Находим первый подходящий путь (самый длинный, который подходит)
                                const activeItem = sortedNav.find(nav => {
                                    // Точное совпадение
                                    if (location.pathname === nav.href)
                                        return true;
                                    // Для /admin проверяем только точное совпадение или /admin/
                                    if (nav.href === '/admin') {
                                        return location.pathname === '/admin' || location.pathname === '/admin/';
                                    }
                                    // Для остальных путей проверяем, начинается ли текущий путь с nav.href + '/'
                                    if (location.pathname.startsWith(nav.href + '/'))
                                        return true;
                                    return false;
                                });
                                const isActive = activeItem?.href === item.href || isSubmenuItemActive;
                                return (_jsx("div", { children: hasSubmenu ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => toggleSubmenu(item.name), className: `w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'text-gray-700 hover:bg-gray-100'}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { children: item.name })] }), _jsx("span", { className: `transform transition-transform ${isSubmenuExpanded ? 'rotate-90' : ''}`, children: "\u203A" })] }), isSubmenuExpanded && (_jsx("div", { className: "ml-4 mt-1 space-y-1", children: item.submenu?.map((subItem) => {
                                                    const SubIcon = subItem.icon;
                                                    const isSubActive = location.pathname === subItem.href || location.pathname.startsWith(subItem.href + '/');
                                                    return (_jsxs(Link, { to: subItem.href, onClick: () => setSidebarOpen(false), className: `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors ${isSubActive
                                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                                            : 'text-gray-600 hover:bg-gray-50'}`, children: [_jsx(SubIcon, { className: "h-4 w-4" }), _jsx("span", { children: subItem.name })] }, subItem.name));
                                                }) }))] })) : (_jsxs(Link, { to: item.href, onClick: () => setSidebarOpen(false), className: `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { children: item.name })] })) }, item.name));
                            }) }), _jsxs("div", { className: "px-4 py-4 border-t border-gray-200 space-y-2", children: [_jsxs(Link, { to: "/search", onClick: () => setSidebarOpen(false), className: "w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200", children: [_jsx(Store, { className: "h-4 w-4" }), _jsx("span", { children: "\u041A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0430\u044F \u0447\u0430\u0441\u0442\u044C" })] }), _jsx("div", { className: "flex items-center space-x-3 mb-3", children: _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: user?.full_name || 'Администратор' }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user?.email })] }) }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { children: "\u0412\u044B\u0445\u043E\u0434" })] })] })] }) }), _jsxs("div", { className: "lg:pr-64", children: [_jsx("header", { className: "bg-white shadow-sm sticky top-0 z-10", children: _jsxs("div", { className: "flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsx(Link, { to: "/admin", className: "text-xl font-bold text-primary-600", children: "ZAKUP.ONE" }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Link, { to: "/search", className: "flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors", title: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0443\u044E \u0447\u0430\u0441\u0442\u044C", children: [_jsx(Store, { className: "h-5 w-5" }), _jsx("span", { className: "hidden sm:inline", children: "\u041A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0430\u044F \u0447\u0430\u0441\u0442\u044C" })] }), _jsx("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden text-gray-500 hover:text-gray-700", children: _jsx(Menu, { className: "h-6 w-6" }) })] })] }) }), _jsx("main", { className: "p-4 sm:p-6 lg:p-8", children: _jsx(Outlet, {}) })] })] }));
}
