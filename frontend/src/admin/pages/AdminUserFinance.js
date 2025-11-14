import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Страница управления финансовой информацией пользователя
 * Доступна только администраторам
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../shared/api';
import { formatPrice } from '../../shared/utils/formatters';
import { Loader2, Save, ArrowLeft, DollarSign, CreditCard } from 'lucide-react';
export default function AdminUserFinance() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // Финансовые данные
    const [financialData, setFinancialData] = useState({
        deposit_name: '',
        deposit_valuation: 0,
        credit_limit: 0,
        credit_term: 30,
    });
    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);
    const fetchUserData = async () => {
        try {
            setLoading(true);
            // TODO: Заменить на реальный API endpoint для получения финансовой информации пользователя
            // const userData = await adminApi.getUserFinance(parseInt(userId!))
            // Временные данные для демонстрации
            const users = await adminApi.getUsers();
            const foundUser = users.find(u => u.id === parseInt(userId));
            if (foundUser) {
                setUser(foundUser);
                // В реальном приложении эти данные будут загружаться с сервера
                setFinancialData({
                    deposit_name: 'Недвижимость, г. Бишкек, ул. Чуй, д. 123',
                    deposit_valuation: 100000,
                    credit_limit: 50000,
                    credit_term: 30,
                });
            }
            else {
                setError('Пользователь не найден');
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка загрузки данных');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            // TODO: Заменить на реальный API endpoint для сохранения финансовой информации
            // await adminApi.updateUserFinance(parseInt(userId!), financialData)
            // Временная имитация сохранения
            await new Promise(resolve => setTimeout(resolve, 500));
            setSuccess('Финансовая информация успешно обновлена');
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка сохранения данных');
        }
        finally {
            setSaving(false);
        }
    };
    const handleCreditLimitChange = (value) => {
        setFinancialData({
            ...financialData,
            credit_limit: value,
        });
    };
    const handleDepositValuationChange = (value) => {
        const newValuation = value;
        const newCreditLimit = Math.floor(newValuation * 0.5); // 50% от оценочной стоимости
        setFinancialData({
            ...financialData,
            deposit_valuation: newValuation,
            credit_limit: newCreditLimit,
        });
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    if (!user) {
        return (_jsx("div", { className: "max-w-4xl mx-auto", children: _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-red-800", children: error || 'Пользователь не найден' }) }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("button", { onClick: () => navigate('/admin/users'), className: "flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "\u041D\u0430\u0437\u0430\u0434 \u043A \u0441\u043F\u0438\u0441\u043A\u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"] }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" }), _jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [user.full_name, " (", user.email, ")"] })] }), error && (_jsx("div", { className: "mb-4 bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-red-800 text-sm", children: error }) })), success && (_jsx("div", { className: "mb-4 bg-green-50 border border-green-200 rounded-lg p-4", children: _jsx("p", { className: "text-green-800 text-sm", children: success }) })), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("h2", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-2 text-green-600" }), "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F"] }) }), _jsx("div", { className: "p-6 space-y-6", children: _jsxs("div", { className: "border-b border-gray-200 pb-6", children: [_jsxs("h3", { className: "text-md font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(CreditCard, { className: "h-5 w-5 mr-2 text-blue-600" }), "\u0417\u0430\u043B\u043E\u0433 \u043A\u043B\u0438\u0435\u043D\u0442\u0430"] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043B\u043E\u0433\u0430" }), _jsx("div", { className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700", children: financialData.deposit_name || 'Не указано' }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043B\u043E\u0433\u0430 \u0443\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u043C \u0432 \u0435\u0433\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u0435" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-2", children: "\u041E\u0446\u0435\u043D\u043E\u0447\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C (\u0441\u043E\u043C)" }), _jsx("input", { type: "number", value: financialData.deposit_valuation, onChange: (e) => handleDepositValuationChange(parseFloat(e.target.value) || 0), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500", placeholder: "0", min: "0", step: "1000" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043E\u0446\u0435\u043D\u043E\u0447\u043D\u0443\u044E \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430\u043B\u043E\u0433\u0430" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-2", children: "\u041B\u0438\u043C\u0438\u0442 \u043D\u0430 \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0443 (\u0441\u043E\u043C)" }), _jsx("input", { type: "number", value: financialData.credit_limit, onChange: (e) => handleCreditLimitChange(parseFloat(e.target.value) || 0), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500", placeholder: "0", min: "0", step: "1000" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043A\u0430\u043A 50% \u043E\u0442 \u043E\u0446\u0435\u043D\u043E\u0447\u043D\u043E\u0439 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-2", children: "\u0421\u0440\u043E\u043A \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0438 (\u0434\u043D\u0435\u0439)" }), _jsx("input", { type: "number", value: financialData.credit_term, onChange: (e) => setFinancialData({ ...financialData, credit_term: parseInt(e.target.value) || 0 }), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500", placeholder: "30", min: "1", step: "1" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0441\u0440\u043E\u043A \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0438 \u0432 \u0434\u043D\u044F\u0445" })] })] }), _jsxs("div", { className: "mt-6 pt-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-3", children: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center justify-between bg-green-50 rounded-lg px-4 py-3 border border-green-200 h-16", children: [_jsx("div", { className: "flex flex-col", children: _jsx("p", { className: "text-xs text-gray-600", children: "\u041E\u0446\u0435\u043D\u043E\u0447\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C" }) }), _jsx("p", { className: "text-xl font-bold text-green-700 whitespace-nowrap ml-4", children: formatPrice(financialData.deposit_valuation) })] }), _jsxs("div", { className: "flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3 border border-primary-200 h-16", children: [_jsx("div", { className: "flex flex-col", children: _jsx("p", { className: "text-xs text-gray-600", children: "\u041B\u0438\u043C\u0438\u0442 \u043D\u0430 \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0443" }) }), _jsx("p", { className: "text-xl font-bold text-primary-700 whitespace-nowrap ml-4", children: formatPrice(financialData.credit_limit) })] }), _jsxs("div", { className: "flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 h-16", children: [_jsx("div", { className: "flex flex-col", children: _jsx("p", { className: "text-xs text-gray-600", children: "\u0421\u0440\u043E\u043A \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0438" }) }), _jsxs("p", { className: "text-xl font-bold text-blue-700 whitespace-nowrap ml-4", children: [financialData.credit_term, " \u0434\u043D\u0435\u0439"] })] })] })] })] }) }), _jsx("div", { className: "bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end", children: _jsx("button", { onClick: handleSave, disabled: saving, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed", children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"] })) }) })] })] }));
}
