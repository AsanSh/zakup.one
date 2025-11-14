import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Главный роутер приложения
 * Разделение на клиентскую и админскую части
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ClientLayout from './client/components/ClientLayout';
import AdminLayout from './admin/components/AdminLayout';
import Login from './shared/components/Login';
import Register from './shared/components/Register';
// Loading component
const LoadingSpinner = () => (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) }));
// Client pages - lazy loading для оптимизации
const Catalog = lazy(() => import('./client/pages/Catalog'));
const Cart = lazy(() => import('./client/pages/Cart'));
const OrderHistory = lazy(() => import('./client/pages/OrderHistory'));
const OrderCreate = lazy(() => import('./client/pages/OrderCreate'));
const DeliveryStatus = lazy(() => import('./client/pages/DeliveryStatus'));
const Profile = lazy(() => import('./client/pages/Profile'));
// Admin pages - lazy loading для оптимизации
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminPriceLists = lazy(() => import('./admin/pages/AdminPriceLists'));
const AdminPriceListUpdates = lazy(() => import('./admin/pages/AdminPriceListUpdates'));
const AdminPriceManagement = lazy(() => import('./admin/pages/AdminPriceManagement'));
const AdminCounterparties = lazy(() => import('./admin/pages/AdminCounterparties'));
const AdminSuppliersManagement = lazy(() => import('./admin/pages/AdminSuppliersManagement'));
const AdminUserFinance = lazy(() => import('./admin/pages/AdminUserFinance'));
const AdminProcurement = lazy(() => import('./admin/pages/AdminProcurement'));
const AdminDrivers = lazy(() => import('./admin/pages/AdminDrivers'));
const AdminAccessManagement = lazy(() => import('./admin/pages/AdminAccessManagement'));
const AdminManagement = lazy(() => import('./admin/pages/AdminManagement'));
const AdminProductPromotions = lazy(() => import('./admin/pages/AdminProductPromotions'));
/**
 * Защищенный роут - требует аутентификации
 * Администраторы могут видеть клиентскую часть для проверки интерфейса
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, isInitialized } = useAuthStore();
    // Ждем инициализации перед проверкой
    if (!isInitialized) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Разрешаем доступ всем аутентифицированным пользователям (включая админов)
    return _jsx(_Fragment, { children: children });
}
/**
 * Админский роут - требует аутентификации и прав администратора
 */
function AdminRoute({ children }) {
    const { isAuthenticated, user, isInitialized } = useAuthStore();
    // Ждем инициализации перед проверкой
    if (!isInitialized) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (!user?.is_admin) {
        return _jsx(Navigate, { to: "/search", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
function App() {
    return (_jsx(Router, { future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(ClientLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/search", replace: true }) }), _jsx(Route, { path: "search", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(Catalog, {}) }) }), _jsx(Route, { path: "cart", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(Cart, {}) }) }), _jsx(Route, { path: "orders", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(OrderHistory, {}) }) }), _jsx(Route, { path: "orders/create", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(OrderCreate, {}) }) }), _jsx(Route, { path: "delivery-status", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(DeliveryStatus, {}) }) }), _jsx(Route, { path: "profile", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(Profile, {}) }) })] }), _jsxs(Route, { path: "/admin", element: _jsx(AdminRoute, { children: _jsx(AdminLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "users", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminUsers, {}) }) }), _jsx(Route, { path: "users/:userId/finance", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminUserFinance, {}) }) }), _jsx(Route, { path: "orders", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminOrders, {}) }) }), _jsx(Route, { path: "products", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminProducts, {}) }) }), _jsx(Route, { path: "counterparties", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminCounterparties, {}) }) }), _jsx(Route, { path: "counterparties/suppliers", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminSuppliersManagement, {}) }) }), _jsx(Route, { path: "counterparties/procurement", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminProcurement, {}) }) }), _jsx(Route, { path: "counterparties/drivers", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminDrivers, {}) }) }), _jsx(Route, { path: "counterparties/access", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminAccessManagement, {}) }) }), _jsx(Route, { path: "management", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminManagement, {}) }) }), _jsx(Route, { path: "management/price-lists", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminPriceLists, {}) }) }), _jsx(Route, { path: "management/prices", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminPriceManagement, {}) }) }), _jsx(Route, { path: "management/products", element: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AdminProductPromotions, {}) }) }), _jsx(Route, { path: "price-lists", element: _jsx(Navigate, { to: "/admin/management/price-lists", replace: true }) }), _jsx(Route, { path: "price-lists/management/updates", element: _jsx(Navigate, { to: "/admin/management/price-lists", replace: true }) }), _jsx(Route, { path: "price-lists/management/prices", element: _jsx(Navigate, { to: "/admin/management/prices", replace: true }) }), _jsx(Route, { path: "price-lists/management/suppliers", element: _jsx(Navigate, { to: "/admin/counterparties/suppliers", replace: true }) }), _jsx(Route, { path: "price-lists/management/counterparties", element: _jsx(Navigate, { to: "/admin/counterparties", replace: true }) })] })] }) }));
}
export default App;
