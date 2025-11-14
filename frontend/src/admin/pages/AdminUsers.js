import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../shared/api';
import { Loader2, CheckCircle, XCircle, UserCheck, UserX, DollarSign } from 'lucide-react';
// User type imported from shared/types
export default function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingUsers();
        }
        else {
            fetchUsers();
        }
    }, [activeTab]);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers();
            setUsers(data);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка загрузки пользователей');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getPendingUsers();
            setPendingUsers(data);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка загрузки заявок на регистрацию');
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerify = async (userId) => {
        try {
            await adminApi.verifyUser(userId);
            if (activeTab === 'pending') {
                fetchPendingUsers();
            }
            else {
                fetchUsers();
            }
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка верификации');
        }
    };
    const handleActivate = async (userId) => {
        try {
            await adminApi.activateUser(userId);
            if (activeTab === 'pending') {
                fetchPendingUsers();
            }
            else {
                fetchUsers();
            }
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка активации');
        }
    };
    const handleDeactivate = async (userId) => {
        try {
            await adminApi.deactivateUser(userId);
            if (activeTab === 'pending') {
                fetchPendingUsers();
            }
            else {
                fetchUsers();
            }
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка деактивации');
        }
    };
    const handleReject = async (userId) => {
        const reason = prompt('Отклонить заявку на регистрацию? Пользователь будет деактивирован.\n\nУкажите причину отклонения (необязательно):');
        if (reason === null) {
            return; // Пользователь отменил
        }
        try {
            await adminApi.rejectUser(userId, reason || undefined);
            fetchPendingUsers();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка отклонения заявки');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    const displayUsers = activeTab === 'pending' ? pendingUsers : users;
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\u043C\u0438" }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4", children: error })), _jsx("div", { className: "mb-6 border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsxs("button", { onClick: () => setActiveTab('pending'), className: `py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: ["\u041D\u0430 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0438 (", pendingUsers.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('all'), className: `py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: ["\u0412\u0441\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u044B (", users.length, ")"] })] }) }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "ID" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0424\u0418\u041E" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: displayUsers.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: user.id }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: user.email }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: user.full_name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: user.company }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [user.is_verified ? (_jsxs("span", { className: "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "\u0412\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D"] })) : (_jsxs("span", { className: "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800", children: [_jsx(XCircle, { className: "h-3 w-3 mr-1" }), "\u041D\u0435 \u0432\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D"] })), user.is_active ? (_jsx("span", { className: "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800", children: "\u0410\u043A\u0442\u0438\u0432\u0435\u043D" })) : (_jsx("span", { className: "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800", children: "\u0414\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D" })), user.is_admin && (_jsx("span", { className: "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800", children: "\u0410\u0434\u043C\u0438\u043D" }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [activeTab === 'all' && (_jsxs("button", { onClick: () => navigate(`/admin/users/${user.id}/finance`), className: "text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors", title: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0444\u0438\u043D\u0430\u043D\u0441\u0430\u043C\u0438", children: [_jsx(DollarSign, { className: "h-4 w-4" }), _jsx("span", { children: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B" })] })), activeTab === 'pending' && !user.is_verified && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => handleVerify(user.id), className: "text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors", title: "\u041E\u0434\u043E\u0431\u0440\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443", children: [_jsx(UserCheck, { className: "h-4 w-4" }), _jsx("span", { children: "\u041E\u0434\u043E\u0431\u0440\u0438\u0442\u044C" })] }), _jsxs("button", { onClick: () => handleReject(user.id), className: "text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors", title: "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443", children: [_jsx(UserX, { className: "h-4 w-4" }), _jsx("span", { children: "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C" })] })] })), activeTab === 'all' && (_jsxs(_Fragment, { children: [!user.is_verified && (_jsxs("button", { onClick: () => handleVerify(user.id), className: "text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors", title: "\u0412\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: [_jsx(UserCheck, { className: "h-4 w-4" }), _jsx("span", { children: "\u0412\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u0442\u044C" })] })), user.is_active ? (_jsxs("button", { onClick: () => handleDeactivate(user.id), className: "text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors", title: "\u0414\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: [_jsx(UserX, { className: "h-4 w-4" }), _jsx("span", { children: "\u0414\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C" })] })) : (_jsxs("button", { onClick: () => handleActivate(user.id), className: "text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors", title: "\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: [_jsx(UserCheck, { className: "h-4 w-4" }), _jsx("span", { children: "\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C" })] }))] }))] }) })] }, user.id))) })] }) })] }));
}
